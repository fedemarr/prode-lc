import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  const tab = searchParams.tab === "eliminacion" ? "eliminacion" : "grupos";

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const [groupEntries, koEntries] = tournament
    ? await Promise.all([
        prisma.leaderboardEntry.findMany({
          where: { tournamentId: tournament.id, phase: "GROUP_FINAL" },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: [{ rankPosition: "asc" }],
        }),
        prisma.leaderboardEntry.findMany({
          where: { tournamentId: tournament.id, phase: "knockout" },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: [{ rankPosition: "asc" }],
        }),
      ])
    : [[], []];

  // Fallback to "total" if GROUP_FINAL snapshot doesn't exist yet
  const resolvedGroupEntries =
    groupEntries.length > 0
      ? groupEntries
      : tournament
      ? await prisma.leaderboardEntry.findMany({
          where: { tournamentId: tournament.id, phase: "total" },
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: [{ rankPosition: "asc" }],
        })
      : [];

  const entries = tab === "grupos" ? resolvedGroupEntries : koEntries;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="font-outfit text-2xl font-bold text-white">Ranking</h1>
        <p className="text-white/40 text-sm mt-1">
          {tab === "grupos" ? "Ranking Final — Fase de Grupos" : "Ranking Eliminación Directa"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <Link
          href="/ranking?tab=grupos"
          className={cn(
            "flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all border",
            tab === "grupos"
              ? "cedros-gradient text-white border-brand-blue-light/40 shadow-lg"
              : "bg-white/5 text-white/50 border-white/8 hover:text-white hover:bg-white/10"
          )}
        >
          ⚽ Fase de Grupos
          <span className="ml-1.5 text-[10px] font-bold opacity-60">FINAL</span>
        </Link>
        <Link
          href="/ranking?tab=eliminacion"
          className={cn(
            "flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all border",
            tab === "eliminacion"
              ? "cedros-gradient text-white border-brand-blue-light/40 shadow-lg"
              : "bg-white/5 text-white/50 border-white/8 hover:text-white hover:bg-white/10"
          )}
        >
          ⚔️ Eliminación
          {koEntries.length > 0 && (
            <span className="ml-1.5 text-[10px] font-bold opacity-60">PREMIO</span>
          )}
        </Link>
      </div>

      {tab === "eliminacion" && koEntries.length === 0 ? (
        <div className="text-center text-white/30 py-12 bg-[#0F1A2E] border border-white/8 rounded-2xl">
          <p className="text-3xl mb-3">⚔️</p>
          <p className="font-semibold text-white/50">Ranking de eliminación</p>
          <p className="text-sm mt-2">Comienza cuando el admin inicialice el ranking</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center text-white/30 py-12">
          <p className="text-lg">Todavía no hay puntos registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[entries[1], entries[0], entries[2]].map((entry, i) => {
                const podiumPos = i === 0 ? 2 : i === 1 ? 1 : 3;
                const emoji = podiumPos === 1 ? "🥇" : podiumPos === 2 ? "🥈" : "🥉";
                const isMe = entry.userId === session!.user.id;
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "rounded-xl border p-3 text-center",
                      podiumPos === 1
                        ? "border-brand-yellow/40 bg-brand-yellow/8 order-2"
                        : "border-white/8 bg-[#0F1A2E]",
                      i === 0 && "order-1",
                      i === 2 && "order-3"
                    )}
                  >
                    <p className="text-2xl mb-1">{emoji}</p>
                    <p className={cn("text-xs font-semibold truncate", isMe ? "text-brand-yellow" : "text-white")}>
                      {entry.user.firstName}
                    </p>
                    <p className={cn("font-outfit text-xl font-black mt-1", podiumPos === 1 ? "text-brand-yellow" : "text-white")}>
                      {entry.points}
                    </p>
                    <p className="text-[9px] text-white/30">pts</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div className="space-y-1.5">
            {entries.map((entry, i) => {
              const rank = i + 1;
              const isMe = entry.userId === session!.user.id;
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    isMe ? "bg-brand-yellow/8 border-brand-yellow/30" : "bg-[#0F1A2E] border-white/6",
                    rank <= 3 && "border-white/10"
                  )}
                >
                  <div className="w-8 text-center flex-shrink-0">
                    <span className="font-outfit font-black text-sm text-white/50">
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-semibold text-sm truncate", isMe ? "text-brand-yellow" : "text-white")}>
                      {entry.user.firstName} {entry.user.lastName}
                      {isMe && <span className="text-xs opacity-60 ml-1">(vos)</span>}
                    </p>
                    <p className="text-[10px] text-white/35 mt-0.5">
                      {entry.exactHits} exactos · {entry.winnerHits} resultado
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn("font-outfit text-xl font-black", isMe ? "text-brand-yellow" : "text-white")}>
                      {entry.points}
                    </p>
                    <p className="text-[10px] text-white/30">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
