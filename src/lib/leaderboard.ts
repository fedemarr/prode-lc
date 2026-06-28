import { prisma } from "@/lib/prisma";

async function buildLeaderboardForPhase(
  tournamentId: string,
  phase: string,
  matchIds: string[]
) {
  const allPredictions = await prisma.prediction.findMany({
    where: { matchId: { in: matchIds } },
    select: { userId: true, matchId: true, pointsEarned: true, resultType: true },
  });

  const bestPerUserMatch: Record<string, { points: number; resultType: string | null }> = {};
  for (const pred of allPredictions) {
    const key = `${pred.userId}::${pred.matchId}`;
    const pts = pred.pointsEarned ?? 0;
    if (!(key in bestPerUserMatch) || pts > bestPerUserMatch[key].points) {
      bestPerUserMatch[key] = { points: pts, resultType: pred.resultType };
    }
  }

  const userStats: Record<string, { points: number; exactHits: number; winnerHits: number }> = {};
  for (const [key, best] of Object.entries(bestPerUserMatch)) {
    const userId = key.split("::")[0];
    if (!userStats[userId]) userStats[userId] = { points: 0, exactHits: 0, winnerHits: 0 };
    userStats[userId].points += best.points;
    if (best.resultType === "EXACT") userStats[userId].exactHits++;
    if (best.resultType === "WINNER") userStats[userId].winnerHits++;
  }

  for (const [userId, stats] of Object.entries(userStats)) {
    await prisma.leaderboardEntry.upsert({
      where: { userId_tournamentId_phase: { userId, tournamentId, phase } },
      update: { points: stats.points, exactHits: stats.exactHits, winnerHits: stats.winnerHits },
      create: { userId, tournamentId, phase, points: stats.points, exactHits: stats.exactHits, winnerHits: stats.winnerHits, rankPosition: 0 },
    });
  }

  const entries = await prisma.leaderboardEntry.findMany({
    where: { tournamentId, phase },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }, { winnerHits: "desc" }],
  });
  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboardEntry.update({ where: { id: entries[i].id }, data: { rankPosition: i + 1 } });
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
  // Initialize all approved users at 0 for a clean slate on first run
  const allUsers = await prisma.user.findMany({
    where: { status: "APPROVED" },
    select: { id: true },
  });
  for (const user of allUsers) {
    await prisma.leaderboardEntry.upsert({
      where: { userId_tournamentId_phase: { userId: user.id, tournamentId, phase: "knockout" } },
      update: {},
      create: { userId: user.id, tournamentId, phase: "knockout", points: 0, exactHits: 0, winnerHits: 0, rankPosition: 0 },
    });
  }

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
    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboardEntry.update({ where: { id: entries[i].id }, data: { rankPosition: i + 1 } });
    }
    return;
  }

  await buildLeaderboardForPhase(tournamentId, "knockout", finishedKoMatches.map((m) => m.id));

  // Ensure users with 0 ko points still appear (fill gaps)
  const existingUserIds = new Set(
    (await prisma.leaderboardEntry.findMany({ where: { tournamentId, phase: "knockout" }, select: { userId: true } }))
      .map((e) => e.userId)
  );
  for (const user of allUsers) {
    if (!existingUserIds.has(user.id)) {
      await prisma.leaderboardEntry.create({
        data: { userId: user.id, tournamentId, phase: "knockout", points: 0, exactHits: 0, winnerHits: 0, rankPosition: allUsers.length },
      });
    }
  }
}
