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

  const match = await prisma.match.update({
    where: { id: params.id },
    data: {
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      status: status || "FINISHED",
    },
    include: { tournament: true },
  });

  // Calculate points for all predictions
  const predictions = await prisma.prediction.findMany({
    where: { matchId: match.id },
  });

  const config = match.tournament.scoringConfig as { exact: number; winner: number };

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

    // Update leaderboard
    await updateLeaderboard(pred.userId, match.tournamentId, points, resultType);
  }

  return NextResponse.json({ success: true, match });
}

async function updateLeaderboard(
  userId: string,
  tournamentId: string,
  points: number,
  resultType: string
) {
  const isExact = resultType === "EXACT";
  const isWinner = resultType === "WINNER";

  // Update total
  await prisma.leaderboardEntry.upsert({
    where: { userId_tournamentId_phase: { userId, tournamentId, phase: "total" } },
    update: {
      points: { increment: points },
      exactHits: { increment: isExact ? 1 : 0 },
      winnerHits: { increment: isWinner ? 1 : 0 },
    },
    create: {
      userId,
      tournamentId,
      phase: "total",
      points,
      exactHits: isExact ? 1 : 0,
      winnerHits: isWinner ? 1 : 0,
    },
  });

  // Rebuild rank positions
  const entries = await prisma.leaderboardEntry.findMany({
    where: { tournamentId, phase: "total" },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }],
  });

  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboardEntry.update({
      where: { id: entries[i].id },
      data: { rankPosition: i + 1 },
    });
  }
}
