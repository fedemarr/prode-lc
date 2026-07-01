export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { formatDateTime, formatDate, formatTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FixMatchTimesButton } from "@/components/fix-match-times-button";
import { AlertTriangle } from "lucide-react";

export default async function AdminVotesPage() {
  const matches = await prisma.match.findMany({
    where: { phase: "GROUP" },
    include: {
      homeTeam: true,
      awayTeam: true,
      predictions: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { submittedAt: "asc" },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const totalVotes = matches.reduce((acc, m) => acc + m.predictions.length, 0);
  const matchesWithVotes = matches.filter((m) => m.predictions.length > 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Registro de Votos</h1>
          <p className="text-white/40 text-sm mt-1">
            {totalVotes} pronósticos · {matchesWithVotes.length} partidos con votos
          </p>
        </div>
        <FixMatchTimesButton />
      </div>

      <div className="space-y-6">
        {matches.map((match) => {
          const kickoff = new Date(match.scheduledAt);

          return (
            <div key={match.id} className="bg-[#0F1A2E] border border-white/8 rounded-2xl overflow-hidden">
              {/* Match header */}
              <div className="flex items-center justify-between p-4 border-b border-white/8">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-white">
                    {match.homeTeam.flag} {match.homeTeam.name} vs {match.awayTeam.name} {match.awayTeam.flag}
                  </span>
                  <span className="text-xs text-white/30 hidden sm:inline">{match.roundLabel}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-white/40">{formatDateTime(kickoff)}</span>
                  <Badge
                    variant={match.status === "FINISHED" ? "secondary" : match.status === "LIVE" ? "destructive" : "outline"}
                    className="text-[9px]"
                  >
                    {match.status === "FINISHED" ? "Fin" : match.status === "LIVE" ? "🔴 Live" : "Pendiente"}
                  </Badge>
                  <span className="text-xs text-white/50 bg-white/8 px-2 py-0.5 rounded-full">
                    {match.predictions.length} votos
                  </span>
                </div>
              </div>

              {/* Predictions */}
              {match.predictions.length === 0 ? (
                <p className="text-white/20 text-xs p-4">Sin pronósticos</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {match.predictions.map((pred) => {
                    const submittedAt = new Date(pred.submittedAt);
                    const votedAfterKickoff = submittedAt >= kickoff;
                    const minutesBeforeKickoff = Math.round((kickoff.getTime() - submittedAt.getTime()) / 60000);

                    return (
                      <div
                        key={pred.id}
                        className={`flex items-center gap-3 px-4 py-2.5 ${votedAfterKickoff ? "bg-red-500/8" : ""}`}
                      >
                        {/* User */}
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium ${votedAfterKickoff ? "text-red-400" : "text-white"}`}>
                            {pred.user.firstName} {pred.user.lastName}
                          </span>
                          {pred.chanceNumber > 1 && (
                            <span className="ml-1.5 text-[10px] text-brand-yellow bg-brand-yellow/10 px-1.5 py-0.5 rounded-full">
                              Chance {pred.chanceNumber}
                            </span>
                          )}
                        </div>

                        {/* Predicted score */}
                        <span className="font-outfit font-black text-white text-sm tabular-nums">
                          {pred.homeScore} — {pred.awayScore}
                        </span>

                        {/* Points */}
                        {pred.pointsEarned != null && (
                          <span className={`text-xs font-bold w-10 text-right tabular-nums ${
                            pred.pointsEarned === 5 ? "text-brand-yellow"
                            : pred.pointsEarned === 2 ? "text-brand-blue-light"
                            : "text-white/30"
                          }`}>
                            +{pred.pointsEarned}pts
                          </span>
                        )}

                        {/* Submission time */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 justify-end">
                            {votedAfterKickoff && (
                              <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                            )}
                            <span className={`text-xs font-mono ${votedAfterKickoff ? "text-red-400 font-bold" : "text-white/40"}`}>
                              {formatTime(submittedAt)}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/25">
                            {formatDate(submittedAt)}
                            {!votedAfterKickoff && minutesBeforeKickoff > 0 && (
                              <span className="ml-1 text-white/20">
                                ({minutesBeforeKickoff}min antes)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
