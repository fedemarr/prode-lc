import { prisma } from "@/lib/prisma";

export async function rebuildLeaderboard(tournamentId: string) {
  const stats = await prisma.$queryRaw<
    { userId: string; points: bigint; exactHits: bigint; winnerHits: bigint }[]
  >`
    SELECT
      p."userId",
      COALESCE(SUM(p."pointsEarned"), 0)                                   AS points,
      COUNT(*) FILTER (WHERE p."resultType" = 'EXACT'::"ResultType")       AS "exactHits",
      COUNT(*) FILTER (WHERE p."resultType" = 'WINNER'::"ResultType")      AS "winnerHits"
    FROM "Prediction" p
    JOIN "Match" m ON m.id = p."matchId"
    WHERE p."tournamentId" = ${tournamentId}
      AND m.status = 'FINISHED'::"MatchStatus"
    GROUP BY p."userId"
  `;

  await Promise.all(
    stats.map((s) =>
      prisma.leaderboardEntry.upsert({
        where: { userId_tournamentId_phase: { userId: s.userId, tournamentId, phase: "total" } },
        update: {
          points: Number(s.points),
          exactHits: Number(s.exactHits),
          winnerHits: Number(s.winnerHits),
        },
        create: {
          userId: s.userId,
          tournamentId,
          phase: "total",
          points: Number(s.points),
          exactHits: Number(s.exactHits),
          winnerHits: Number(s.winnerHits),
          rankPosition: 0,
        },
      })
    )
  );

  const entries = await prisma.leaderboardEntry.findMany({
    where: { tournamentId, phase: "total" },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }, { winnerHits: "desc" }],
  });

  await Promise.all(
    entries.map((e, i) =>
      prisma.leaderboardEntry.update({
        where: { id: e.id },
        data: { rankPosition: i + 1 },
      })
    )
  );
}
