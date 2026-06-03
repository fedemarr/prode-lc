import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/match-card";

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
  if (!tournament) {
    return (
      <div className="p-6 text-center text-white/50">
        No hay torneos activos en este momento.
      </div>
    );
  }

  const matches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, phase: "GROUP" },
    include: {
      homeTeam: true,
      awayTeam: true,
      predictions: {
        where: { userId: session!.user.id },
        select: { homeScore: true, awayScore: true, pointsEarned: true, resultType: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  // Group by roundLabel
  const grouped = matches.reduce((acc, match) => {
    const key = match.roundLabel;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, typeof matches>);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Partidos</h1>
        <p className="text-white/50 text-sm mt-1">Fase de Grupos — {tournament.name}</p>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([round, roundMatches]) => (
          <div key={round}>
            <h2 className="font-outfit font-semibold text-white/70 text-sm uppercase tracking-wider mb-3 px-1">
              {round}
            </h2>
            <div className="space-y-3">
              {roundMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  id={match.id}
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  homeScore={match.homeScore}
                  awayScore={match.awayScore}
                  scheduledAt={match.scheduledAt}
                  status={match.status}
                  roundLabel={match.roundLabel}
                  prediction={match.predictions[0] ?? null}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
