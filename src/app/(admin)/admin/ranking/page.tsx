import { prisma } from "@/lib/prisma";
import { Download } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminRankingPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab === "eliminacion" ? "eliminacion" : "grupos";
  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const [groupEntries, koEntries] = tournament
    ? await Promise.all([
        prisma.leaderboardEntry.findMany({
          where: { tournamentId: tournament.id, phase: "GROUP_FINAL" },
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: [{ rankPosition: "asc" }],
        }),
        prisma.leaderboardEntry.findMany({
          where: { tournamentId: tournament.id, phase: "knockout" },
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: [{ rankPosition: "asc" }],
        }),
      ])
    : [[], []];

  const resolvedGroupEntries =
    groupEntries.length > 0
      ? groupEntries
      : tournament
      ? await prisma.leaderboardEntry.findMany({
          where: { tournamentId: tournament.id, phase: "total" },
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
          orderBy: [{ rankPosition: "asc" }],
        })
      : [];

  const entries = tab === "grupos" ? resolvedGroupEntries : koEntries;

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Ranking</h1>
          <p className="text-white/50 text-sm mt-1">{entries.length} participantes</p>
        </div>
        <a
          href="/api/admin/export/ranking"
          className="flex items-center gap-2 px-4 py-2 bg-[#1A2235] border border-white/10 rounded-lg text-sm text-white/70 hover:text-white hover:border-white/20 transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar Excel
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <Link
          href="/admin/ranking?tab=grupos"
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
            tab === "grupos"
              ? "cedros-gradient text-white border-brand-blue-light/40"
              : "bg-white/5 text-white/50 border-white/8 hover:text-white"
          )}
        >
          ⚽ Fase de Grupos
          <span className="ml-1 text-[10px] opacity-60">FINAL</span>
        </Link>
        <Link
          href="/admin/ranking?tab=eliminacion"
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
            tab === "eliminacion"
              ? "cedros-gradient text-white border-brand-blue-light/40"
              : "bg-white/5 text-white/50 border-white/8 hover:text-white"
          )}
        >
          ⚔️ Eliminación
          <span className="ml-1 text-[10px] opacity-60">PREMIO GORDO</span>
        </Link>
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
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-white/40">
                  {tab === "eliminacion"
                    ? "Presioná Recalcular para inicializar el ranking de eliminación"
                    : "Sin datos de ranking todavía"}
                </td>
              </tr>
            ) : (
              entries.map((e, i) => {
                const rank = i + 1;
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
