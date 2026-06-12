import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/scoring";
import { rebuildLeaderboard } from "@/lib/leaderboard";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
    if (!tournament) return NextResponse.json({ error: "No hay torneo activo" }, { status: 404 });

    const config = tournament.scoringConfig as { exact: number; winner: number };

    // Get all finished matches with scores
    const finishedMatches = await prisma.match.findMany({
      where: { tournamentId: tournament.id, status: "FINISHED" },
      select: { id: true, homeScore: true, awayScore: true },
    });

    // Process each match sequentially to avoid connection pool issues
    for (const match of finishedMatches) {
      if (match.homeScore === null || match.awayScore === null) continue;

      const predictions = await prisma.prediction.findMany({
        where: { matchId: match.id },
      });

      // Update predictions sequentially to stay within connection pool limit (5)
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
    }

    // Rebuild full leaderboard
    await rebuildLeaderboard(tournament.id);

    const usersUpdated = await prisma.leaderboardEntry.count({
      where: { tournamentId: tournament.id, phase: "total" },
    });

    const matchesProcessed = finishedMatches.length;
    const totalPredictions = await prisma.prediction.count({
      where: { matchId: { in: finishedMatches.map((m) => m.id) } },
    });

    return NextResponse.json({ ok: true, usersUpdated, matchesProcessed, totalPredictions });
  } catch (e: any) {
    console.error("Recalculate error:", e);
    return NextResponse.json({ error: e?.message ?? "Error interno" }, { status: 500 });
  }
}
