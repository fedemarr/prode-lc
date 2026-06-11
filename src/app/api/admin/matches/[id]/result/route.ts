import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/scoring";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { homeScore, awayScore, status } = await req.json();

  // 1. Update match result
  const match = await prisma.match.update({
    where: { id: params.id },
    data: {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      status: status || "FINISHED",
    },
    include: { tournament: true },
  });

  const config = match.tournament.scoringConfig as { exact: number; winner: number };

  // 2. Recalculate points for ALL predictions of this match
  const predictions = await prisma.prediction.findMany({
    where: { matchId: match.id },
  });

  for (const pred of predictions) {
    const { points, resultType } = calculatePoints(
      { home: pred.homeScore, away: pred.awayScore },
      { home: match.homeScore!, away: match.awayScore! },
      config
    );
    await prisma.prediction.update({
      where: { id: pred.id },
      data: { pointsEarned: points, resultType },
    });
  }

  // 3. Rebuild leaderboard from scratch for the entire tournament
  await rebuildLeaderboard(match.tournamentId);

  return NextResponse.json({ success: true, match, updated: predictions.length });
}

async function rebuildLeaderboard(tournamentId: string) {
  // Get all finished matches for this tournament
  const finishedMatches = await prisma.match.findMany({
    where: { tournamentId, status: "FINISHED" },
    select: { id: true },
  });
  const finishedIds = finishedMatches.map((m) => m.id);

  // Get all predictions for finished matches, grouped by user
  const allPredictions = await prisma.prediction.findMany({
    where: { tournamentId, matchId: { in: finishedIds } },
    select: { userId: true, pointsEarned: true, resultType: true },
  });

  // Aggregate per user
  const userStats: Record<string, { points: number; exactHits: number; winnerHits: number }> = {};
  for (const pred of allPredictions) {
    if (!userStats[pred.userId]) {
      userStats[pred.userId] = { points: 0, exactHits: 0, winnerHits: 0 };
    }
    userStats[pred.userId].points += pred.pointsEarned ?? 0;
    if (pred.resultType === "EXACT") userStats[pred.userId].exactHits++;
    if (pred.resultType === "WINNER") userStats[pred.userId].winnerHits++;
  }

  // Upsert leaderboard entries for every user who has predictions
  for (const [userId, stats] of Object.entries(userStats)) {
    await prisma.leaderboardEntry.upsert({
      where: { userId_tournamentId_phase: { userId, tournamentId, phase: "total" } },
      update: {
        points: stats.points,
        exactHits: stats.exactHits,
        winnerHits: stats.winnerHits,
      },
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

  // Rebuild rank positions ordered by points desc, exactHits desc, winnerHits desc
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
