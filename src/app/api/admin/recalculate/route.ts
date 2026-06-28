import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePoints } from "@/lib/scoring";
import { rebuildLeaderboard, rebuildKnockoutLeaderboard } from "@/lib/leaderboard";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
    if (!tournament) return NextResponse.json({ error: "No hay torneo activo" }, { status: 404 });

    const config = tournament.scoringConfig as { exact: number; winner: number };

    // Fetch all finished matches and all their predictions in two queries
    const finishedMatches = await prisma.match.findMany({
      where: { tournamentId: tournament.id, status: "FINISHED" },
      select: { id: true, homeScore: true, awayScore: true },
    });

    const matchIds = finishedMatches.map((m) => m.id);
    const allPredictions = await prisma.prediction.findMany({
      where: { matchId: { in: matchIds } },
    });

    // Build result map for O(1) lookups
    const resultMap = new Map(
      finishedMatches
        .filter((m) => m.homeScore !== null && m.awayScore !== null)
        .map((m) => [m.id, { home: m.homeScore!, away: m.awayScore! }])
    );

    // Calculate all updates in memory, then batch in a single transaction
    const updateOps = allPredictions
      .filter((p) => resultMap.has(p.matchId))
      .map((p) => {
        const result = resultMap.get(p.matchId)!;
        const { points, resultType } = calculatePoints(
          { home: p.homeScore, away: p.awayScore },
          result,
          config
        );
        return prisma.prediction.update({
          where: { id: p.id },
          data: { pointsEarned: points, resultType },
        });
      });

    // Single transaction — one DB round-trip instead of N×M
    await prisma.$transaction(updateOps);

    await rebuildLeaderboard(tournament.id);
    await rebuildKnockoutLeaderboard(tournament.id);

    const usersUpdated = await prisma.leaderboardEntry.count({
      where: { tournamentId: tournament.id, phase: "total" },
    });

    return NextResponse.json({
      ok: true,
      usersUpdated,
      matchesProcessed: finishedMatches.length,
      totalPredictions: allPredictions.length,
    });
  } catch (e: unknown) {
    console.error("Recalculate error:", e);
    return NextResponse.json({ error: (e as Error)?.message ?? "Error interno" }, { status: 500 });
  }
}
