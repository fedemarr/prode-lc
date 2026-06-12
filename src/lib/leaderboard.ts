import { prisma } from "@/lib/prisma";

export async function rebuildLeaderboard(tournamentId: string) {
  // Get finished match IDs explicitly (avoids relation filter issues)
  const finishedMatches = await prisma.match.findMany({
    where: { tournamentId, status: "FINISHED" },
    select: { id: true },
  });
  const finishedMatchIds = finishedMatches.map((m) => m.id);

  if (finishedMatchIds.length === 0) return;

  const allPredictions = await prisma.prediction.findMany({
    where: { matchId: { in: finishedMatchIds } },
    select: { userId: true, matchId: true, pointsEarned: true, resultType: true },
  });

  // Per user+match keep only the best prediction (highest points)
  // This ensures multiple chances never give more than max 5 pts per match
  const bestPerUserMatch: Record<string, { points: number; resultType: string | null }> = {};
  for (const pred of allPredictions) {
    const key = `${pred.userId}::${pred.matchId}`;
    const pts = pred.pointsEarned ?? 0;
    if (!(key in bestPerUserMatch) || pts > bestPerUserMatch[key].points) {
      bestPerUserMatch[key] = { points: pts, resultType: pred.resultType };
    }
  }

  // Aggregate per user
  const userStats: Record<string, { points: number; exactHits: number; winnerHits: number }> = {};
  for (const [key, best] of Object.entries(bestPerUserMatch)) {
    const userId = key.split("::")[0];
    if (!userStats[userId]) userStats[userId] = { points: 0, exactHits: 0, winnerHits: 0 };
    userStats[userId].points += best.points;
    if (best.resultType === "EXACT") userStats[userId].exactHits++;
    if (best.resultType === "WINNER") userStats[userId].winnerHits++;
  }

  // Upsert sequentially to stay within connection pool limit (5)
  for (const [userId, stats] of Object.entries(userStats)) {
    await prisma.leaderboardEntry.upsert({
      where: { userId_tournamentId_phase: { userId, tournamentId, phase: "total" } },
      update: { points: stats.points, exactHits: stats.exactHits, winnerHits: stats.winnerHits },
      create: {
        userId,
        tournamentId,
        phase: "total",
        points: stats.points,
        exactHits: stats.exactHits,
        winnerHits: stats.winnerHits,
        rankPosition: 0,
      },
    });
  }

  // Rebuild rank positions
  const entries = await prisma.leaderboardEntry.findMany({
    where: { tournamentId, phase: "total" },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }, { winnerHits: "desc" }],
  });

  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboardEntry.update({
      where: { id: entries[i].id },
      data: { rankPosition: i + 1 },
    });
  }
}
