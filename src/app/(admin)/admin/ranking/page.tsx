import { prisma } from "@/lib/prisma";
import { Download } from "lucide-react";

export default async function AdminRankingPage() {
  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const entries = tournament
    ? await prisma.leaderboardEntry.findMany({
        where: { tournamentId: tournament.id, phase: "total" },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: [{ points: "desc" }, { exactHits: "desc" }],
      })
    : [];

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Ranking General</h1>
          <p className="text-white/50 text-sm mt-1">{entries.length} participantes con puntos</p>
        </div>
        <a
          href="/api/admin/export/ranking"
          className="flex items-center gap-2 px-4 py-2 bg-[#1A2235] border border-white/10 rounded-lg text-sm text-white/70 hover:text-white hover:border-white/20 transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar Excel
        </a>
      </div>

      <div className="bg-[#1A2235] border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left p-4 text-xs font-medium text-white/40">#</th>
              <th className="text-left p-4 text-xs font-medium text-white/40">Participante</th>
              <th className="text-right p-4 text-xs font-medium text-white/40">Puntos</th>
              <th className="text-right p-4 text-xs font-medium text-white/40 hidden md:table-cell">Exactos</th>
              <th className="text-right p-4 text-xs font-medium text-white/40 hidden md:table-cell">Resultado</th>
              <th className="text-right p-4 text-xs font-medium text-white/40 hidden lg:table-cell">% Aciertos</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-white/40">
                  Sin datos de ranking todavía
                </td>
              </tr>
            ) : (
              entries.map((e, i) => {
                const rank = i + 1;
                const total = e.exactHits + e.winnerHits;
                const played = total;
                const accuracy = played > 0 ? Math.round((total / (played + 1)) * 100) : 0;

                return (
                  <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                    <td className="p-4">
                      <span className="font-outfit font-bold text-white/60 text-sm">
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-white">
                        {e.user.firstName} {e.user.lastName}
                      </p>
                      <p className="text-xs text-white/40">{e.user.email}</p>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-outfit font-bold text-[#00C27C] text-lg">{e.points}</span>
                    </td>
                    <td className="p-4 text-right text-sm text-white/70 hidden md:table-cell">{e.exactHits}</td>
                    <td className="p-4 text-right text-sm text-white/70 hidden md:table-cell">{e.winnerHits}</td>
                    <td className="p-4 text-right text-sm text-white/50 hidden lg:table-cell">{accuracy}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
