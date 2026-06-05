import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/match-card";
import Link from "next/link";
import { cn } from "@/lib/utils";

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: { group?: string };
}) {
  const session = await getServerSession(authOptions);
  const selectedGroup = searchParams.group ?? "J"; // default Grupo J (Argentina)

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
  if (!tournament) {
    return <div className="p-6 text-center text-white/50">No hay torneos activos.</div>;
  }

  const matches = await prisma.match.findMany({
    where: {
      tournamentId: tournament.id,
      phase: "GROUP",
      groupName: selectedGroup,
    },
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

  // Group by round (Fecha 1, 2, 3)
  const grouped = matches.reduce((acc, match) => {
    const key = match.roundLabel;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, typeof matches>);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="font-outfit text-2xl font-bold text-white">Partidos</h1>
        <p className="text-white/40 text-sm mt-1">Fase de Grupos — {tournament.name}</p>
      </div>

      {/* Group tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {GROUPS.map((g) => (
          <Link
            key={g}
            href={`/matches?group=${g}`}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all border",
              selectedGroup === g
                ? "cedros-gradient text-white border-brand-blue-light/50 shadow-lg shadow-brand-blue/20"
                : "bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10"
            )}
          >
            {g}
          </Link>
        ))}
      </div>

      {/* Matches */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center text-white/30 py-12">No hay partidos para este grupo</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([round, roundMatches]) => (
            <div key={round}>
              <h2 className="font-outfit font-semibold text-white/60 text-xs uppercase tracking-widest mb-3 px-1">
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
      )}
    </div>
  );
}
