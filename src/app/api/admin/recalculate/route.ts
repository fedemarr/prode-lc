import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/scoring";
import { rebuildLeaderboard } from "@/lib/leaderboard";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
  if (!tournament) return NextResponse.json({ error: "No hay torneo activo" }, { status: 404 });

  const config = tournament.scoringConfig as { exact: number; winner: number };

  // Get all finished matches
  const finishedMatches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, status: "FINISHED" },
    select: { id: true, homeScore: true, awayScore: true },
  });

  // Recalculate points for all predictions of all finished matches in parallel
  await Promise.all(
    finishedMatches.map(async (match) => {
      if (match.homeScore === null || match.awayScore === null) return;
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
    })
  );

  // Rebuild leaderboard from scratch
  await rebuildLeaderboard(tournament.id);

  const usersUpdated = await prisma.leaderboardEntry.count({
    where: { tournamentId: tournament.id, phase: "total" },
  });

  return NextResponse.json({ ok: true, usersUpdated });
}
