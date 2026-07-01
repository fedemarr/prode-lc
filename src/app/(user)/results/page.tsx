export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const predictions = tournament
    ? await prisma.prediction.findMany({
        where: {
          userId: session!.user.id,
          tournamentId: tournament.id,
          match: { status: "FINISHED" },
        },
        include: {
          match: { include: { homeTeam: true, awayTeam: true } },
        },
        orderBy: { match: { scheduledAt: "desc" } },
      })
    : [];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Resultados</h1>
        <p className="text-white/50 text-sm mt-1">Partidos finalizados con mis pronósticos</p>
      </div>

      {predictions.length === 0 ? (
        <div className="text-center text-white/40 py-12">
          <p>Todavía no hay resultados disponibles</p>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((pred) => (
            <div
              key={pred.id}
              className={`bg-[#1A2235] border rounded-xl p-4 ${
                pred.resultType === "EXACT"
                  ? "border-[#00C27C]/30"
                  : pred.resultType === "WINNER"
                  ? "border-[#FFB800]/30"
                  : "border-[#FF453A]/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/40">{pred.match.roundLabel}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      pred.resultType === "EXACT"
                        ? "default"
                        : pred.resultType === "WINNER"
                        ? "amber"
                        : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {pred.resultType === "EXACT" ? "Exacto" : pred.resultType === "WINNER" ? "Resultado" : "Fallo"}
                  </Badge>
                  <span className={`font-bold text-sm ${
                    pred.resultType === "EXACT" ? "text-[#00C27C]"
                    : pred.resultType === "WINNER" ? "text-[#FFB800]"
                    : "text-white/30"
                  }`}>
                    +{pred.pointsEarned ?? 0}pts
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xl">{pred.match.homeTeam.flag}</span>
                  <span className="text-sm font-medium text-white">{pred.match.homeTeam.name}</span>
                </div>

                <div className="text-center px-3">
                  <p className="font-outfit font-bold text-white">
                    {pred.match.homeScore} — {pred.match.awayScore}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">
                    Mi: {pred.homeScore}–{pred.awayScore}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm font-medium text-white text-right">{pred.match.awayTeam.name}</span>
                  <span className="text-xl">{pred.match.awayTeam.flag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
