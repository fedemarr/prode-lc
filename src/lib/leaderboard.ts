import { prisma } from "@/lib/prisma";

export async function rebuildLeaderboard(tournamentId: string) {
  // Get all predictions on finished matches
  const allPredictions = await prisma.prediction.findMany({
    where: {
      tournamentId,
      match: { status: "FINISHED" },
    },
    select: { userId: true, pointsEarned: true, resultType: true },
  });

  // Aggregate per user in JS
  const userStats: Record<string, { points: number; exactHits: number; winnerHits: number }> = {};
  for (const pred of allPredictions) {
    if (!userStats[pred.userId]) {
      userStats[pred.userId] = { points: 0, exactHits: 0, winnerHits: 0 };
    }
    userStats[pred.userId].points += pred.pointsEarned ?? 0;
    if (pred.resultType === "EXACT") userStats[pred.userId].exactHits++;
    if (pred.resultType === "WINNER") userStats[pred.userId].winnerHits++;
  }

  // Upsert all leaderboard entries in parallel
  await Promise.all(
    Object.entries(userStats).map(([userId, stats]) =>
      prisma.leaderboardEntry.upsert({
        where: { userId_tournamentId_phase: { userId, tournamentId, phase: "total" } },
        update: { points: stats.points, exactHits: stats.exactHits, winnerHits: stats.winnerHits },
        create: { userId, tournamentId, phase: "total", points: stats.points, exactHits: stats.exactHits, winnerHits: stats.winnerHits, rankPosition: 0 },
      })
    )
  );

  // Rebuild rank positions
  const entries = await prisma.leaderboardEntry.findMany({
    where: { tournamentId, phase: "total" },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }, { winnerHits: "desc" }],
  });

  await Promise.all(
    entries.map((e, i) =>
      prisma.leaderboardEntry.update({ where: { id: e.id }, data: { rankPosition: i + 1 } })
    )
  );
}
