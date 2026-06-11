import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
  if (!tournament) return NextResponse.json({ error: "No hay torneo activo" }, { status: 404 });

  const config = tournament.scoringConfig as { exact: number; winner: number };

  // 1. Recalculate pointsEarned for every prediction on finished matches
  const finishedMatches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, status: "FINISHED" },
    select: { id: true, homeScore: true, awayScore: true },
  });

  for (const match of finishedMatches) {
    if (match.homeScore === null || match.awayScore === null) continue;
    const predictions = await prisma.prediction.findMany({ where: { matchId: match.id } });
    for (const pred of predictions) {
      const { points, resultType } = calculatePoints(
        { home: pred.homeScore, away: pred.awayScore },
        { home: match.homeScore, away: match.awayScore },
        config
      );
      await prisma.prediction.update({
        where: { id: pred.id },
        data: { pointsEarned: points, resultType },
      });
    }
  }

  // 2. Rebuild leaderboard from scratch
  const allPredictions = await prisma.prediction.findMany({
    where: {
      tournamentId: tournament.id,
      matchId: { in: finishedMatches.map((m) => m.id) },
    },
    select: { userId: true, pointsEarned: true, resultType: true },
  });

  const userStats: Record<string, { points: number; exactHits: number; winnerHits: number }> = {};
  for (const pred of allPredictions) {
    if (!userStats[pred.userId]) userStats[pred.userId] = { points: 0, exactHits: 0, winnerHits: 0 };
    userStats[pred.userId].points += pred.pointsEarned ?? 0;
    if (pred.resultType === "EXACT") userStats[pred.userId].exactHits++;
    if (pred.resultType === "WINNER") userStats[pred.userId].winnerHits++;
  }

  for (const [userId, stats] of Object.entries(userStats)) {
    await prisma.leaderboardEntry.upsert({
      where: { userId_tournamentId_phase: { userId, tournamentId: tournament.id, phase: "total" } },
      update: { points: stats.points, exactHits: stats.exactHits, winnerHits: stats.winnerHits },
      create: { userId, tournamentId: tournament.id, phase: "total", points: stats.points, exactHits: stats.exactHits, winnerHits: stats.winnerHits, rankPosition: 0 },
    });
  }

  const entries = await prisma.leaderboardEntry.findMany({
    where: { tournamentId: tournament.id, phase: "total" },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }, { winnerHits: "desc" }],
  });

  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboardEntry.update({
      where: { id: entries[i].id },
      data: { rankPosition: i + 1 },
    });
  }

  return NextResponse.json({
    ok: true,
    matchesProcessed: finishedMatches.length,
    usersUpdated: Object.keys(userStats).length,
  });
}
