"use client";

import { useState, useEffect } from "react";
import { Loader2, Minus, Plus, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Team { name: string; flag?: string | null; abbreviation: string; }
interface Prediction { homeScore: number; awayScore: number; pointsEarned?: number | null; resultType?: string | null; }
interface Match {
  id: string; phase: string; roundLabel: string; venue: string;
  scheduledAt: Date | string; status: string;
  homeScore?: number | null; awayScore?: number | null;
  homeTeam: Team; awayTeam: Team;
  predictions: Prediction[];
}

interface Props {
  byPhase: { R32: Match[]; R16: Match[]; QF: Match[]; SF: Match[]; FINAL: Match[] };
  userId: string;
}

const PHASES = [
  { key: "R32", label: "32avos", short: "32" },
  { key: "R16", label: "Octavos", short: "16" },
  { key: "QF", label: "Cuartos", short: "4F" },
  { key: "SF", label: "Semifinales", short: "SF" },
  { key: "FINAL", label: "Final", short: "🏆" },
] as const;

export function KnockoutBracket({ byPhase, userId }: Props) {
  const [activePhase, setActivePhase] = useState<string>("R32");
  const matches = byPhase[activePhase as keyof typeof byPhase] ?? [];

  return (
    <div className="flex flex-col flex-1">
      {/* Phase tabs */}
      <div className="px-4 md:px-6 pb-4">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {PHASES.map(({ key, label, short }) => {
            const count = byPhase[key as keyof typeof byPhase]?.length ?? 0;
            return (
              <button key={key} onClick={() => setActivePhase(key)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border",
                  activePhase === key
                    ? "cedros-gradient text-white border-brand-blue-light/40 shadow-lg"
                    : "bg-white/5 text-white/50 border-white/8 hover:text-white hover:bg-white/10"
                )}>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{short}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  activePhase === key ? "bg-white/20 text-white" : "bg-white/10 text-white/40")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches */}
      <div className="px-4 md:px-6 pb-6 flex-1">
        {activePhase === "FINAL" && byPhase.FINAL.length > 0 ? (
          <FinalMatch match={byPhase.FINAL[0]} />
        ) : (
          <div className={cn(
            "grid gap-3",
            activePhase === "R32" ? "grid-cols-1 md:grid-cols-2" :
            activePhase === "R16" ? "grid-cols-1 md:grid-cols-2" :
            activePhase === "QF" ? "grid-cols-1 md:grid-cols-2" :
            "grid-cols-1 max-w-lg mx-auto w-full"
          )}>
            {matches.map((match) => (
              <KnockoutMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FinalMatch({ match }: { match: Match }) {
  const isPlaceholder = match.homeTeam.abbreviation === "MEX" && match.awayTeam.abbreviation === "USA"
    && match.status === "PENDING" && match.homeScore === null;

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="bg-gradient-to-br from-brand-yellow/20 to-brand-blue/20 border-2 border-brand-yellow/40 rounded-2xl overflow-hidden">
        <div className="cedros-gradient px-4 py-3 text-center">
          <p className="font-outfit font-black text-white text-lg tracking-wide">🏆 GRAN FINAL</p>
          <p className="text-white/60 text-xs mt-0.5">{match.venue} · {formatDateTime(match.scheduledAt)}</p>
        </div>
        <div className="p-6">
          <KnockoutMatchCard match={match} isFinal />
        </div>
      </div>
    </div>
  );
}

function KnockoutMatchCard({ match, isFinal = false }: { match: Match; isFinal?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [home, setHome] = useState(match.predictions[0]?.homeScore ?? 0);
  const [away, setAway] = useState(match.predictions[0]?.awayScore ?? 0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(match.predictions.length > 0);
  const [confirming, setConfirming] = useState(false);

  const [pastKickoff, setPastKickoff] = useState(false);
  useEffect(() => {
    const ms = new Date(match.scheduledAt).getTime() - Date.now();
    if (ms <= 0) { setPastKickoff(true); return; }
    const t = setTimeout(() => setPastKickoff(true), ms);
    return () => clearTimeout(t);
  }, [match.scheduledAt]);

  const tbd = match.homeTeam.name === "México" && match.awayTeam.name === "Estados Unidos"
    && match.homeScore === null && match.status === "PENDING";

  const canPredict = !tbd && match.status === "PENDING" && !submitted && !pastKickoff;
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";

  async function save() {
    if (!confirming) { setConfirming(true); return; }
    setLoading(true);
    const res = await fetch("/api/predictions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: match.id, homeScore: home, awayScore: away }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      toast({ title: "Error", description: d.error, variant: "destructive" });
      setConfirming(false); return;
    }
    setSubmitted(true); setConfirming(false);
    toast({ title: "✓ Pronóstico enviado" });
    router.refresh();
  }

  return (
    <div className={cn(
      "bg-[#0F1A2E] border rounded-xl overflow-hidden",
      isFinal ? "border-brand-yellow/20" : "border-white/8",
      isLive && "border-red-500/40"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/6">
        <span className="text-[10px] text-white/35 truncate">{match.roundLabel}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {isLive && <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />EN VIVO</span>}
          {isFinished && <span className="text-[10px] text-white/30 font-medium">Finalizado</span>}
          {!isLive && !isFinished && <span className="text-[10px] text-white/30">{formatDateTime(match.scheduledAt)}</span>}
        </div>
      </div>

      {/* Teams */}
      <div className="p-3">
        {tbd ? (
          <div className="text-center py-3">
            <p className="text-white/25 text-sm">Por definir</p>
            <p className="text-white/15 text-xs mt-1">Se define según clasificación de grupos</p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <TeamDisplay team={match.homeTeam} />
            <div className="text-center flex-shrink-0">
              {isFinished || isLive ? (
                <p className="font-outfit text-xl font-black text-white">
                  {match.homeScore} — {match.awayScore}
                </p>
              ) : submitted ? (
                <div className="text-center">
                  <p className="font-outfit text-lg font-black text-brand-yellow">
                    {match.predictions[0].homeScore} — {match.predictions[0].awayScore}
                  </p>
                  <p className="text-[9px] text-white/25 mt-0.5">Tu pronóstico</p>
                </div>
              ) : (
                <span className="text-white/25 text-sm font-medium">vs</span>
              )}
            </div>
            <TeamDisplay team={match.awayTeam} right />
          </div>
        )}
      </div>

      {/* Prediction */}
      {canPredict && !confirming && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <ScoreBtn value={home} onChange={setHome} />
            <button onClick={save}
              className="flex-1 h-8 rounded-lg text-xs font-bold cedros-gradient text-white flex items-center justify-center gap-1">
              Pronosticar <ChevronRight className="w-3 h-3" />
            </button>
            <ScoreBtn value={away} onChange={setAway} />
          </div>
        </div>
      )}

      {canPredict && confirming && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-center text-white/60">
            ¿Confirmás <span className="text-brand-yellow font-bold">{home} — {away}</span>?
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button onClick={() => setConfirming(false)}
              className="h-8 rounded-lg text-xs border border-white/15 text-white/60 hover:bg-white/5">
              Cancelar
            </button>
            <button onClick={save} disabled={loading}
              className="h-8 rounded-lg text-xs font-black bg-brand-yellow text-[#0F2570] flex items-center justify-center">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "¡Confirmar!"}
            </button>
          </div>
        </div>
      )}

      {submitted && !isFinished && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between bg-white/4 rounded-lg px-3 py-1.5">
            <span className="text-[10px] text-white/30">Pronóstico enviado</span>
            <span className="text-[10px] font-bold text-brand-yellow">
              {match.predictions[0].homeScore} — {match.predictions[0].awayScore}
            </span>
          </div>
        </div>
      )}

      {isFinished && match.predictions[0]?.resultType && (
        <div className="px-3 pb-3">
          <div className={cn("rounded-lg px-3 py-1.5 text-center text-xs font-bold",
            match.predictions[0].resultType === "EXACT" ? "bg-brand-yellow/15 text-brand-yellow" :
            match.predictions[0].resultType === "WINNER" ? "bg-brand-blue/20 text-brand-blue-light" :
            "bg-white/5 text-white/30")}>
            {match.predictions[0].resultType === "EXACT" ? `✓ Exacto +${match.predictions[0].pointsEarned}pts` :
             match.predictions[0].resultType === "WINNER" ? `✓ Resultado +${match.predictions[0].pointsEarned}pts` :
             "✗ Sin puntos"}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamDisplay({ team, right = false }: { team: Team; right?: boolean }) {
  return (
    <div className={cn("flex items-center gap-1.5 flex-1 min-w-0", right && "flex-row-reverse text-right")}>
      <span className="text-xl flex-shrink-0">{team.flag ?? "🏳️"}</span>
      <span className="text-xs font-semibold text-white truncate">{team.name}</span>
    </div>
  );
}

function ScoreBtn({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(Math.max(0, value - 1))}
        className="w-6 h-6 rounded bg-white/8 flex items-center justify-center text-white hover:bg-white/15">
        <Minus className="w-3 h-3" />
      </button>
      <span className="font-outfit font-black text-white text-base w-5 text-center">{value}</span>
      <button onClick={() => onChange(Math.min(20, value + 1))}
        className="w-6 h-6 rounded bg-white/8 flex items-center justify-center text-white hover:bg-white/15">
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}
