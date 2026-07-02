import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const BATCH = 500;

async function buildLeaderboardForPhase(
  tournamentId: string,
  phase: string,
  matchIds: string[]
) {
  const allPredictions = await prisma.prediction.findMany({
    where: { matchId: { in: matchIds } },
    select: { userId: true, pointsEarned: true, resultType: true },
  });

  // Sumar TODOS los votos y chances de cada usuario (no solo el mejor por partido)
  const userStats: Record<string, { points: number; exactHits: number; winnerHits: number }> = {};
  for (const pred of allPredictions) {
    const pts = pred.pointsEarned ?? 0;
    if (!userStats[pred.userId]) userStats[pred.userId] = { points: 0, exactHits: 0, winnerHits: 0 };
    userStats[pred.userId].points += pts;
    if (pred.resultType === "EXACT") userStats[pred.userId].exactHits++;
    if (pred.resultType === "WINNER") userStats[pred.userId].winnerHits++;
  }

  // Batch upsert: INSERT ... ON CONFLICT DO UPDATE — one query per 500 users
  const statsEntries = Object.entries(userStats);
  for (let i = 0; i < statsEntries.length; i += BATCH) {
    const chunk = statsEntries.slice(i, i + BATCH);
    await prisma.$executeRaw(
      Prisma.sql`
        INSERT INTO "LeaderboardEntry" ("id", "userId", "tournamentId", "phase", "points", "exactHits", "winnerHits", "rankPosition", "updatedAt")
        VALUES ${Prisma.join(
          chunk.map(([userId, stats]) =>
            Prisma.sql`(gen_random_uuid()::text, ${userId}, ${tournamentId}, ${phase}, ${stats.points}, ${stats.exactHits}, ${stats.winnerHits}, 0, NOW())`
          )
        )}
        ON CONFLICT ("userId", "tournamentId", "phase")
        DO UPDATE SET
          "points"     = EXCLUDED."points",
          "exactHits"  = EXCLUDED."exactHits",
          "winnerHits" = EXCLUDED."winnerHits",
          "updatedAt"  = NOW()
      `
    );
  }

  const entries = await prisma.leaderboardEntry.findMany({
    where: { tournamentId, phase },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }, { winnerHits: "desc" }],
  });

  // Batch rank update: UPDATE FROM (VALUES ...) — one query per 500 entries
  for (let i = 0; i < entries.length; i += BATCH) {
    const chunk = entries.slice(i, i + BATCH);
    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "LeaderboardEntry" AS le
        SET "rankPosition" = v.rank
        FROM (VALUES ${Prisma.join(
          chunk.map((e, j) => Prisma.sql`(${e.id}::text, ${i + j + 1}::int)`)
        )}) AS v(id, rank)
        WHERE le.id = v.id
      `
    );
  }
}

export async function rebuildLeaderboard(tournamentId: string) {
  const finishedMatches = await prisma.match.findMany({
    where: { tournamentId, status: "FINISHED" },
    select: { id: true },
  });
  const finishedMatchIds = finishedMatches.map((m) => m.id);
  if (finishedMatchIds.length === 0) return;
  await buildLeaderboardForPhase(tournamentId, "total", finishedMatchIds);
}

export async function rebuildKnockoutLeaderboard(tournamentId: string) {
  const allUsers = await prisma.user.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });

  // Delete existing knockout entries then recreate — avoids sequential upserts
  await prisma.leaderboardEntry.deleteMany({ where: { tournamentId, phase: "knockout" } });
  await prisma.leaderboardEntry.createMany({
    data: allUsers.map((u) => ({
      userId: u.id, tournamentId, phase: "knockout", points: 0, exactHits: 0, winnerHits: 0, rankPosition: 0,
    })),
    skipDuplicates: true,
  });

  const finishedKoMatches = await prisma.match.findMany({
    where: { tournamentId, status: "FINISHED", phase: { not: "GROUP" } },
    select: { id: true },
  });
  if (finishedKoMatches.length === 0) {
    // No finished ko matches yet — assign ranks based on 0 points
    const entries = await prisma.leaderboardEntry.findMany({
      where: { tournamentId, phase: "knockout" },
      orderBy: [{ points: "desc" }, { exactHits: "desc" }],
    });
    for (let i = 0; i < entries.length; i += BATCH) {
      const chunk = entries.slice(i, i + BATCH);
      await prisma.$executeRaw(
        Prisma.sql`
          UPDATE "LeaderboardEntry" AS le
          SET "rankPosition" = v.rank
          FROM (VALUES ${Prisma.join(
            chunk.map((e, j) => Prisma.sql`(${e.id}::text, ${i + j + 1}::int)`)
          )}) AS v(id, rank)
          WHERE le.id = v.id
        `
      );
    }
    return;
  }

  await buildLeaderboardForPhase(tournamentId, "knockout", finishedKoMatches.map((m) => m.id));
}
