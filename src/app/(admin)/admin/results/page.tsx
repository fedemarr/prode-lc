import { prisma } from "@/lib/prisma";
import { MatchResultLoader } from "@/components/match-result-loader";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminResultsPage() {
  const matches = await prisma.match.findMany({
    where: { status: { in: ["LIVE", "PENDING"] } },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "asc" },
    take: 30,
  });

  const finishedRecent = await prisma.match.findMany({
    where: { status: "FINISHED" },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "desc" },
    take: 10,
  });

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Cargar Resultados</h1>
        <p className="text-white/50 text-sm mt-1">Partidos pendientes y en vivo</p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-[#1A2235] border border-white/8 rounded-xl p-6 text-center text-white/40">
          No hay partidos pendientes para cargar resultados
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {matches.map((m) => (
            <div key={m.id} className={`bg-[#1A2235] border rounded-xl p-4 ${m.status === "LIVE" ? "border-[#FF453A]/40" : "border-white/8"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-white/40 text-xs">{formatDateTime(m.scheduledAt)}</span>
                  <span className="text-sm font-medium text-white truncate">
                    {m.homeTeam.flag} {m.homeTeam.name} vs {m.awayTeam.name} {m.awayTeam.flag}
                  </span>
                  <Badge
                    variant={m.status === "LIVE" ? "destructive" : "outline"}
                    className="text-[10px] flex-shrink-0"
                  >
                    {m.status === "LIVE" ? "🔴 En vivo" : "Pendiente"}
                  </Badge>
                </div>
                <MatchResultLoader
                  matchId={m.id}
                  currentStatus={m.status}
                  currentHomeScore={m.homeScore}
                  currentAwayScore={m.awayScore}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent finished */}
      <div>
        <h2 className="font-outfit font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">
          Últimos finalizados
        </h2>
        <div className="space-y-2">
          {finishedRecent.map((m) => (
            <div key={m.id} className="bg-[#1A2235] border border-white/5 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-white/60">
                {m.homeTeam.flag} {m.homeTeam.name} vs {m.awayTeam.name} {m.awayTeam.flag}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-outfit font-bold text-white">
                  {m.homeScore} — {m.awayScore}
                </span>
                <MatchResultLoader
                  matchId={m.id}
                  currentStatus={m.status}
                  currentHomeScore={m.homeScore}
                  currentAwayScore={m.awayScore}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
