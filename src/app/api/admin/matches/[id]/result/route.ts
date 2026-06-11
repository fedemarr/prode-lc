import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/scoring";
import { rebuildLeaderboard } from "@/lib/leaderboard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { homeScore, awayScore, status } = await req.json();

  const match = await prisma.match.update({
    where: { id: params.id },
    data: { homeScore: Number(homeScore), awayScore: Number(awayScore), status: status || "FINISHED" },
    include: { tournament: true },
  });

  const config = match.tournament.scoringConfig as { exact: number; winner: number };

  // Update all predictions for this match in parallel
  const predictions = await prisma.prediction.findMany({ where: { matchId: match.id } });

  await Promise.all(
    predictions.map((pred) => {
      const { points, resultType } = calculatePoints(
        { home: pred.homeScore, away: pred.awayScore },
        { home: match.homeScore!, away: match.awayScore! },
        config
      );
      return prisma.prediction.update({
        where: { id: pred.id },
        data: { pointsEarned: points, resultType },
      });
    })
  );

  // Rebuild full leaderboard
  await rebuildLeaderboard(match.tournamentId);

  return NextResponse.json({ ok: true });
}
