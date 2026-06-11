import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rebuildLeaderboard } from "@/app/api/admin/matches/[id]/result/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
  if (!tournament) return NextResponse.json({ error: "No hay torneo activo" }, { status: 404 });

  const config = tournament.scoringConfig as { exact: number; winner: number };
  const exactPts = config.exact ?? 5;
  const winnerPts = config.winner ?? 2;

  // Recalculate all predictions for all finished matches at once
  await prisma.$executeRaw`
    UPDATE "Prediction" p
    SET
      "pointsEarned" = CASE
        WHEN p."homeScore" = m."homeScore" AND p."awayScore" = m."awayScore" THEN ${exactPts}
        WHEN SIGN(p."homeScore" - p."awayScore") = SIGN(m."homeScore" - m."awayScore") THEN ${winnerPts}
        ELSE 0
      END,
      "resultType" = CASE
        WHEN p."homeScore" = m."homeScore" AND p."awayScore" = m."awayScore" THEN 'EXACT'::"ResultType"
        WHEN SIGN(p."homeScore" - p."awayScore") = SIGN(m."homeScore" - m."awayScore") THEN 'WINNER'::"ResultType"
        ELSE 'WRONG'::"ResultType"
      END
    FROM "Match" m
    WHERE p."matchId" = m.id
      AND m."tournamentId" = ${tournament.id}
      AND m.status = 'FINISHED'::"MatchStatus"
      AND m."homeScore" IS NOT NULL
  `;

  await rebuildLeaderboard(tournament.id);

  const updated = await prisma.leaderboardEntry.count({
    where: { tournamentId: tournament.id, phase: "total" },
  });

  return NextResponse.json({ ok: true, usersUpdated: updated });
}
