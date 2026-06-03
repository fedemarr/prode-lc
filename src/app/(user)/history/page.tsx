import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  const predictions = await prisma.prediction.findMany({
    where: { userId: session!.user.id },
    include: {
      match: { include: { homeTeam: true, awayTeam: true } },
    },
    orderBy: { match: { scheduledAt: "desc" } },
  });

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Historial</h1>
        <p className="text-white/50 text-sm mt-1">Todos mis pronósticos — {predictions.length} total</p>
      </div>

      {predictions.length === 0 ? (
        <div className="text-center text-white/40 py-12">
          <p>No hiciste ningún pronóstico todavía</p>
        </div>
      ) : (
        <div className="space-y-2">
          {predictions.map((pred) => {
            const statusLabel =
              pred.match.status === "PENDING"
                ? "Pendiente"
                : pred.match.status === "LIVE"
                ? "En vivo"
                : "Finalizado";
            const statusVariant =
              pred.match.status === "LIVE"
                ? "destructive"
                : pred.match.status === "FINISHED"
                ? "secondary"
                : "outline";

            return (
              <div key={pred.id} className="bg-[#1A2235] border border-white/8 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/40">{pred.match.roundLabel}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant as any} className="text-[10px]">{statusLabel}</Badge>
                    {pred.resultType && (
                      <Badge
                        variant={pred.resultType === "EXACT" ? "default" : pred.resultType === "WINNER" ? "amber" : "destructive"}
                        className="text-[10px]"
                      >
                        +{pred.pointsEarned ?? 0}pts
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70 truncate flex-1">
                    {pred.match.homeTeam.flag} {pred.match.homeTeam.name}
                  </span>
                  <span className="text-white font-bold px-3">
                    {pred.homeScore}–{pred.awayScore}
                  </span>
                  <span className="text-white/70 truncate flex-1 text-right">
                    {pred.match.awayTeam.name} {pred.match.awayTeam.flag}
                  </span>
                </div>
                <p className="text-xs text-white/30 mt-1">{formatDateTime(pred.match.scheduledAt)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
