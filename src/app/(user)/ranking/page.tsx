import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RankingPage() {
  const session = await getServerSession(authOptions);

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const entries = tournament
    ? await prisma.leaderboardEntry.findMany({
        where: { tournamentId: tournament.id, phase: "total" },
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: [{ points: "desc" }, { exactHits: "desc" }],
      })
    : [];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Ranking General</h1>
        <p className="text-white/50 text-sm mt-1">Puntuación acumulada del torneo</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center text-white/40 py-12">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Todavía no hay puntos registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const rank = i + 1;
            const isMe = entry.userId === session!.user.id;
            const total = entry.exactHits + entry.winnerHits;

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  isMe
                    ? "bg-[#00C27C]/10 border-[#00C27C]/30"
                    : "bg-[#1A2235] border-white/8",
                  rank === 1 && "border-yellow-500/30 bg-yellow-500/5"
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {rank === 1 ? (
                    <span className="text-xl">🥇</span>
                  ) : rank === 2 ? (
                    <span className="text-xl">🥈</span>
                  ) : rank === 3 ? (
                    <span className="text-xl">🥉</span>
                  ) : (
                    <span className="font-outfit font-bold text-white/40 text-sm">#{rank}</span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", isMe ? "text-[#00C27C]" : "text-white")}>
                    {entry.user.firstName} {entry.user.lastName}
                    {isMe && <span className="text-xs ml-1 opacity-70">(vos)</span>}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {entry.exactHits} exactos · {entry.winnerHits} resultados
                  </p>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <p className={cn("font-outfit text-xl font-bold", isMe ? "text-[#00C27C]" : "text-white")}>
                    {entry.points}
                  </p>
                  <p className="text-xs text-white/40">pts</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
