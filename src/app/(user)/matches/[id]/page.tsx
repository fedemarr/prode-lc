import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { MapPin, Clock } from "lucide-react";
import { PredictionInput } from "@/components/prediction-input";
import { LiveBadge } from "@/components/live-badge";
import { Badge } from "@/components/ui/badge";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const [match, user] = await Promise.all([
    prisma.match.findUnique({
      where: { id: params.id },
      include: {
        homeTeam: true,
        awayTeam: true,
        predictions: {
          where: { userId: session!.user.id },
          select: { homeScore: true, awayScore: true, pointsEarned: true, resultType: true, chanceNumber: true },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { chances: true },
    }),
  ]);

  if (!match) return notFound();

  const userChances = user?.chances ?? 1;
  const canPredict = match.status === "PENDING" && new Date() < new Date(match.scheduledAt);
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";

  // Map predictions by chanceNumber
  const predByChance: Record<number, typeof match.predictions[0]> = {};
  for (const p of match.predictions) {
    predByChance[p.chanceNumber] = p;
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto w-full">
      {/* Match header */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-white/40">{match.roundLabel}</span>
          {isLive ? <LiveBadge /> : isFinished ? (
            <Badge variant="secondary">Finalizado</Badge>
          ) : (
            <Badge variant="outline">Pendiente</Badge>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4 my-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <span className="text-5xl">{match.homeTeam.flag ?? "🏳️"}</span>
            <p className="text-sm font-medium text-white text-center">{match.homeTeam.name}</p>
          </div>

          <div className="text-center">
            {isFinished || isLive ? (
              <span className="font-outfit text-4xl font-bold text-white">
                {match.homeScore} — {match.awayScore}
              </span>
            ) : (
              <div>
                <p className="font-outfit text-2xl font-bold text-white/30">VS</p>
                <p className="text-xs text-white/40 mt-1">{formatDateTime(match.scheduledAt)}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <span className="text-5xl">{match.awayTeam.flag ?? "🏳️"}</span>
            <p className="text-sm font-medium text-white text-center">{match.awayTeam.name}</p>
          </div>
        </div>

        {/* Match info */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/5 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {match.venue}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(match.scheduledAt)}
          </span>
        </div>
      </div>

      {/* Prediction forms — one per chance */}
      <div className="space-y-4">
        {Array.from({ length: userChances }, (_, i) => i + 1).map((cn) => {
          const pred = predByChance[cn];

          {/* Result feedback for finished matches */}
          const feedbackBlock = isFinished && pred?.resultType ? (
            <div className={`rounded-xl p-4 text-center border ${
              pred.resultType === "EXACT" ? "bg-[#00C27C]/10 border-[#00C27C]/30"
              : pred.resultType === "WINNER" ? "bg-[#FFB800]/10 border-[#FFB800]/30"
              : "bg-[#FF453A]/10 border-[#FF453A]/30"
            }`}>
              <p className={`font-outfit font-bold text-lg ${
                pred.resultType === "EXACT" ? "text-[#00C27C]"
                : pred.resultType === "WINNER" ? "text-[#FFB800]"
                : "text-[#FF453A]"
              }`}>
                {pred.resultType === "EXACT" ? "¡Pronóstico exacto! 🎯"
                : pred.resultType === "WINNER" ? "Resultado correcto ✓"
                : "Sin puntos ✗"}
                {userChances > 1 && ` — Chance ${cn}`}
              </p>
              {pred.pointsEarned != null && (
                <p className="text-white/60 text-sm mt-1">+{pred.pointsEarned} puntos</p>
              )}
            </div>
          ) : null;

          if (isFinished) {
            return (
              <div key={cn}>
                {feedbackBlock}
                {pred ? (
                  <PredictionInput
                    matchId={match.id}
                    homeTeamName={match.homeTeam.name}
                    awayTeamName={match.awayTeam.name}
                    homeFlag={match.homeTeam.flag}
                    awayFlag={match.awayTeam.flag}
                    initialHome={pred.homeScore}
                    initialAway={pred.awayScore}
                    alreadySubmitted
                    chanceNumber={cn}
                    totalChances={userChances}
                  />
                ) : (
                  <div className="bg-[#1A2235] border border-white/8 rounded-xl p-4 text-center">
                    <p className="text-white/40 text-sm">
                      No hiciste un pronóstico{userChances > 1 ? ` para la chance ${cn}` : ""}
                    </p>
                  </div>
                )}
              </div>
            );
          }

          return (
            <PredictionInput
              key={cn}
              matchId={match.id}
              homeTeamName={match.homeTeam.name}
              awayTeamName={match.awayTeam.name}
              homeFlag={match.homeTeam.flag}
              awayFlag={match.awayTeam.flag}
              initialHome={pred?.homeScore ?? 0}
              initialAway={pred?.awayScore ?? 0}
              alreadySubmitted={!!pred}
              disabled={!canPredict}
              scheduledAt={match.scheduledAt.toISOString()}
              chanceNumber={cn}
              totalChances={userChances}
            />
          );
        })}
      </div>
    </div>
  );
}
