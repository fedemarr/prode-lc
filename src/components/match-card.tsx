"use client";

import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { LiveBadge } from "./live-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Team { name: string; flag?: string | null; abbreviation?: string; }
interface Prediction { homeScore: number; awayScore: number; pointsEarned?: number | null; resultType?: string | null; }

interface MatchCardProps {
  id: string; homeTeam: Team; awayTeam: Team;
  homeScore?: number | null; awayScore?: number | null;
  scheduledAt: Date | string; status: string;
  roundLabel: string; prediction?: Prediction | null; href?: string;
}

export function MatchCard({ id, homeTeam, awayTeam, homeScore, awayScore, scheduledAt, status, roundLabel, prediction, href }: MatchCardProps) {
  const isFinished = status === "FINISHED";
  const isLive = status === "LIVE";
  const resultColor = { EXACT: "text-brand-yellow", WINNER: "text-brand-blue-light", WRONG: "text-red-400" }[prediction?.resultType ?? ""] ?? "";

  return (
    <Link href={href ?? `/matches/${id}`}>
      <div className={cn(
        "bg-[#0F1A2E] border rounded-xl p-3 md:p-4 hover:border-white/20 transition-all cursor-pointer",
        isLive ? "border-red-500/40" : "border-white/8"
      )}>
        {/* Top */}
        <div className="flex items-center justify-between mb-2.5 gap-2">
          <span className="text-[10px] text-white/35 truncate flex-1">{roundLabel}</span>
          <div className="flex-shrink-0">
            {isLive ? <LiveBadge /> :
             isFinished ? <Badge variant="secondary" className="text-[9px] py-0">Finalizado</Badge> :
             <span className="text-[10px] text-white/35 whitespace-nowrap">{formatDateTime(scheduledAt)}</span>}
          </div>
        </div>

        {/* Teams & score */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-xl md:text-2xl flex-shrink-0">{homeTeam.flag ?? "🏳️"}</span>
            <span className="text-xs md:text-sm font-semibold text-white truncate">{homeTeam.name}</span>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 text-center px-2">
            {isFinished || isLive ? (
              <span className="font-outfit text-lg md:text-xl font-black text-white whitespace-nowrap">
                {homeScore ?? 0} — {awayScore ?? 0}
              </span>
            ) : (
              <span className="text-white/25 text-sm">vs</span>
            )}
          </div>

          {/* Away */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
            <span className="text-xs md:text-sm font-semibold text-white truncate text-right">{awayTeam.name}</span>
            <span className="text-xl md:text-2xl flex-shrink-0">{awayTeam.flag ?? "🏳️"}</span>
          </div>
        </div>

        {/* Prediction row */}
        {prediction && (
          <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] text-white/35 flex-shrink-0">Mi pronóstico:</span>
              <span className={cn("text-[10px] font-bold", resultColor || "text-white/60")}>
                {prediction.homeScore} — {prediction.awayScore}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {prediction.pointsEarned !== null && prediction.pointsEarned !== undefined && (
                <span className={cn("text-[10px] font-black", resultColor || "text-white/40")}>
                  +{prediction.pointsEarned}pts
                </span>
              )}
              {prediction.resultType && (
                <Badge variant={prediction.resultType === "EXACT" ? "amber" : prediction.resultType === "WINNER" ? "default" : "destructive"} className="text-[9px] py-0 px-1.5">
                  {prediction.resultType === "EXACT" ? "Exacto" : prediction.resultType === "WINNER" ? "Resultado" : "Fallo"}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
