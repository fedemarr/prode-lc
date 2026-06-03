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

  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      homeTeam: true,
      awayTeam: true,
      predictions: {
        where: { userId: session!.user.id },
        select: { homeScore: true, awayScore: true, pointsEarned: true, resultType: true },
      },
    },
  });

  if (!match) return notFound();

  const myPrediction = match.predictions[0];
  const canPredict = match.status === "PENDING" && new Date() < match.scheduledAt;
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";

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

      {/* Result feedback */}
      {isFinished && myPrediction?.resultType && (
        <div className={`rounded-xl p-4 mb-4 text-center border ${
          myPrediction.resultType === "EXACT"
            ? "bg-[#00C27C]/10 border-[#00C27C]/30"
            : myPrediction.resultType === "WINNER"
            ? "bg-[#FFB800]/10 border-[#FFB800]/30"
            : "bg-[#FF453A]/10 border-[#FF453A]/30"
        }`}>
          <p className={`font-outfit font-bold text-lg ${
            myPrediction.resultType === "EXACT" ? "text-[#00C27C]"
            : myPrediction.resultType === "WINNER" ? "text-[#FFB800]"
            : "text-[#FF453A]"
          }`}>
            {myPrediction.resultType === "EXACT" ? "¡Pronóstico exacto! 🎯"
            : myPrediction.resultType === "WINNER" ? "Resultado correcto ✓"
            : "Sin puntos ✗"}
          </p>
          <p className="text-white/60 text-sm mt-1">
            {myPrediction.pointsEarned !== null ? `+${myPrediction.pointsEarned} puntos` : ""}
          </p>
        </div>
      )}

      {/* Prediction input */}
      {!isFinished && (
        <PredictionInput
          matchId={match.id}
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
          homeFlag={match.homeTeam.flag}
          awayFlag={match.awayTeam.flag}
          initialHome={myPrediction?.homeScore ?? 0}
          initialAway={myPrediction?.awayScore ?? 0}
          disabled={!canPredict}
        />
      )}

      {isFinished && !myPrediction && (
        <div className="bg-[#1A2235] border border-white/8 rounded-xl p-4 text-center">
          <p className="text-white/40 text-sm">No hiciste un pronóstico para este partido</p>
        </div>
      )}
    </div>
  );
}
