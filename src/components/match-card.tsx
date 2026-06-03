"use client";

import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { LiveBadge } from "./live-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Team {
  name: string;
  flag?: string | null;
}

interface Prediction {
  homeScore: number;
  awayScore: number;
  pointsEarned?: number | null;
  resultType?: string | null;
}

interface MatchCardProps {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number | null;
  awayScore?: number | null;
  scheduledAt: Date | string;
  status: string;
  roundLabel: string;
  prediction?: Prediction | null;
  href?: string;
}

export function MatchCard({
  id,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  scheduledAt,
  status,
  roundLabel,
  prediction,
  href,
}: MatchCardProps) {
  const isFinished = status === "FINISHED";
  const isLive = status === "LIVE";

  const resultColor = {
    EXACT: "text-[#00C27C]",
    WINNER: "text-[#FFB800]",
    WRONG: "text-[#FF453A]",
  }[prediction?.resultType ?? ""] ?? "";

  return (
    <Link href={href ?? `/matches/${id}`}>
      <div className={cn(
        "bg-[#1A2235] border rounded-xl p-4 hover:border-white/20 transition-all cursor-pointer",
        isLive ? "border-[#FF453A]/40" : "border-white/8"
      )}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/40 truncate mr-2">{roundLabel}</span>
          {isLive ? (
            <LiveBadge />
          ) : isFinished ? (
            <Badge variant="secondary" className="text-[10px]">Finalizado</Badge>
          ) : (
            <span className="text-xs text-white/40 whitespace-nowrap">{formatDateTime(scheduledAt)}</span>
          )}
        </div>

        {/* Teams & score */}
        <div className="flex items-center justify-between gap-2">
          {/* Home */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl leading-none">{homeTeam.flag ?? "🏳️"}</span>
            <span className="text-sm font-medium text-white truncate">{homeTeam.name}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 px-3">
            {isFinished || isLive ? (
              <span className="font-outfit text-xl font-bold text-white whitespace-nowrap">
                {homeScore ?? 0} — {awayScore ?? 0}
              </span>
            ) : (
              <span className="text-white/30 text-sm">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="text-sm font-medium text-white truncate text-right">{awayTeam.name}</span>
            <span className="text-2xl leading-none">{awayTeam.flag ?? "🏳️"}</span>
          </div>
        </div>

        {/* Prediction row */}
        {prediction && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Mi pronóstico:</span>
              <span className={cn("text-xs font-medium", resultColor || "text-white/70")}>
                {prediction.homeScore} — {prediction.awayScore}
              </span>
            </div>
            {prediction.pointsEarned !== null && prediction.pointsEarned !== undefined && (
              <span className={cn("text-xs font-bold", resultColor || "text-white/50")}>
                +{prediction.pointsEarned} pts
              </span>
            )}
            {prediction.resultType && (
              <Badge
                variant={
                  prediction.resultType === "EXACT"
                    ? "default"
                    : prediction.resultType === "WINNER"
                    ? "amber"
                    : "destructive"
                }
                className="text-[10px]"
              >
                {prediction.resultType === "EXACT" ? "Exacto" : prediction.resultType === "WINNER" ? "Resultado" : "Fallo"}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
