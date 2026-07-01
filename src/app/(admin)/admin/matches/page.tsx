export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { MatchStatusControl } from "@/components/match-status-control";
import { FixMatchTimesButton } from "@/components/fix-match-times-button";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "asc" },
    take: 104,
  });

  const grouped = matches.reduce((acc, m) => {
    const key = m.groupName ? `Grupo ${m.groupName}` : m.phase;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, typeof matches>);

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Partidos y Calendario</h1>
          <p className="text-white/50 text-sm mt-1">{matches.length} partidos totales</p>
        </div>
        <FixMatchTimesButton />
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([group, groupMatches]) => (
          <div key={group}>
            <h2 className="font-outfit font-semibold text-white/70 text-sm uppercase tracking-wider mb-3">
              {group}
            </h2>
            <div className="bg-[#1A2235] border border-white/8 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left p-3 text-xs font-medium text-white/40">Partido</th>
                    <th className="text-left p-3 text-xs font-medium text-white/40 hidden md:table-cell">Fecha</th>
                    <th className="text-left p-3 text-xs font-medium text-white/40">Estado</th>
                    <th className="text-left p-3 text-xs font-medium text-white/40">Resultado</th>
                    <th className="text-right p-3 text-xs font-medium text-white/40">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMatches.map((m) => (
                    <tr key={m.id} className="border-b border-white/5 last:border-0">
                      <td className="p-3">
                        <p className="text-sm text-white">
                          {m.homeTeam.flag} {m.homeTeam.name} vs {m.awayTeam.name} {m.awayTeam.flag}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">{m.venue}</p>
                      </td>
                      <td className="p-3 text-xs text-white/50 hidden md:table-cell">
                        {formatDateTime(m.scheduledAt)}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            m.status === "LIVE" ? "destructive" : m.status === "FINISHED" ? "secondary" : "outline"
                          }
                          className="text-[10px]"
                        >
                          {m.status === "LIVE" ? "🔴 En vivo" : m.status === "FINISHED" ? "Finalizado" : "Pendiente"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {m.homeScore !== null && m.awayScore !== null ? (
                          <span className="font-outfit font-bold text-white text-sm">
                            {m.homeScore} — {m.awayScore}
                          </span>
                        ) : (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <MatchStatusControl
                          matchId={m.id}
                          currentStatus={m.status}
                          currentHomeScore={m.homeScore}
                          currentAwayScore={m.awayScore}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
