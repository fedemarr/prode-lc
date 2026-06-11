import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rebuildLeaderboard } from "@/lib/leaderboard";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { homeScore, awayScore, status } = await req.json();
  const hs = Number(homeScore);
  const as_ = Number(awayScore);

  // 1. Update match result
  const match = await prisma.match.update({
    where: { id: params.id },
    data: { homeScore: hs, awayScore: as_, status: status || "FINISHED" },
    include: { tournament: true },
  });

  const config = match.tournament.scoringConfig as { exact: number; winner: number };
  const exactPts = config.exact ?? 5;
  const winnerPts = config.winner ?? 2;

  // 2. Update all predictions for this match in a single SQL
  await prisma.$executeRaw`
    UPDATE "Prediction"
    SET
      "pointsEarned" = CASE
        WHEN "homeScore" = ${hs} AND "awayScore" = ${as_} THEN ${exactPts}
        WHEN SIGN("homeScore" - "awayScore") = SIGN(${hs} - ${as_}) THEN ${winnerPts}
        ELSE 0
      END,
      "resultType" = CASE
        WHEN "homeScore" = ${hs} AND "awayScore" = ${as_} THEN 'EXACT'::"ResultType"
        WHEN SIGN("homeScore" - "awayScore") = SIGN(${hs} - ${as_}) THEN 'WINNER'::"ResultType"
        ELSE 'WRONG'::"ResultType"
      END
    WHERE "matchId" = ${params.id}
  `;

  // 3. Rebuild leaderboard from scratch using aggregation SQL
  await rebuildLeaderboard(match.tournamentId);

  return NextResponse.json({ ok: true });
}
