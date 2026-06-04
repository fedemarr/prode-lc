"use client";

import { useState } from "react";
import { Minus, Plus, Loader2, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PredictionInputProps {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeFlag?: string | null;
  awayFlag?: string | null;
  initialHome?: number;
  initialAway?: number;
  alreadySubmitted?: boolean;
  disabled?: boolean;
}

export function PredictionInput({
  matchId,
  homeTeamName,
  awayTeamName,
  homeFlag,
  awayFlag,
  initialHome = 0,
  initialAway = 0,
  alreadySubmitted = false,
  disabled = false,
}: PredictionInputProps) {
  const { toast } = useToast();
  const [home, setHome] = useState(initialHome);
  const [away, setAway] = useState(initialAway);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [confirmed, setConfirmed] = useState(false);

  async function save() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore: home, awayScore: away }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Error", description: data.error, variant: "destructive" });
      setConfirmed(false);
      return;
    }

    setSubmitted(true);
    toast({ title: "✓ Pronóstico enviado", description: `${homeTeamName} ${home} — ${away} ${awayTeamName}` });
  }

  // Ya enviado — mostrar bloqueado
  if (submitted || alreadySubmitted) {
    return (
      <div className="bg-[#0F1A2E] border border-brand-blue/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-brand-blue-light" />
          <p className="text-sm font-semibold text-white">Tu pronóstico</p>
          <span className="ml-auto text-xs bg-brand-blue/20 text-brand-yellow border border-brand-blue/30 px-2 py-0.5 rounded-full font-bold">
            ENVIADO
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-1 flex-1">
            <span className="text-4xl">{homeFlag ?? "🏳️"}</span>
            <p className="text-xs text-white/50 text-center">{homeTeamName}</p>
          </div>
          <div className="text-center px-4">
            <p className="font-outfit text-4xl font-black text-white">{home} — {away}</p>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <span className="text-4xl">{awayFlag ?? "🏳️"}</span>
            <p className="text-xs text-white/50 text-center">{awayTeamName}</p>
          </div>
        </div>
        <p className="text-center text-xs text-white/30 mt-4 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Los pronósticos no se pueden modificar una vez enviados
        </p>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
        <Lock className="w-5 h-5 text-white/30 mx-auto mb-2" />
        <p className="text-white/40 text-sm">El período de pronóstico cerró</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl p-5 space-y-5">
      <p className="font-outfit font-semibold text-white text-center">Tu pronóstico</p>

      {/* Aviso importante */}
      <div className="flex items-start gap-2.5 bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl p-3">
        <AlertTriangle className="w-4 h-4 text-brand-yellow flex-shrink-0 mt-0.5" />
        <p className="text-xs text-brand-yellow leading-relaxed">
          <span className="font-bold">Una sola oportunidad.</span> Una vez enviado, el pronóstico no se puede modificar. Revisá bien antes de confirmar.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-2 flex-1">
          <span className="text-4xl">{homeFlag ?? "🏳️"}</span>
          <p className="text-xs text-white/60 text-center font-medium">{homeTeamName}</p>
          <ScoreControl value={home} onChange={(v) => { setHome(v); setConfirmed(false); }} />
        </div>
        <div className="text-white/20 text-2xl font-light pb-6">—</div>
        <div className="flex flex-col items-center gap-2 flex-1">
          <span className="text-4xl">{awayFlag ?? "🏳️"}</span>
          <p className="text-xs text-white/60 text-center font-medium">{awayTeamName}</p>
          <ScoreControl value={away} onChange={(v) => { setAway(v); setConfirmed(false); }} />
        </div>
      </div>

      {/* Confirmación en 2 pasos */}
      {!confirmed ? (
        <Button onClick={save} className="w-full" size="lg">
          Enviar pronóstico
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="bg-brand-blue/15 border border-brand-blue/30 rounded-xl p-3 text-center">
            <p className="text-sm text-white font-medium">
              ¿Confirmás {homeTeamName} <span className="text-brand-yellow font-black">{home} — {away}</span> {awayTeamName}?
            </p>
            <p className="text-xs text-white/40 mt-1">Esta acción no se puede deshacer</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmed(false)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={loading} size="sm"
              className="bg-brand-yellow text-[#0F2570] hover:bg-brand-yellow-light font-black border-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              ¡Confirmar!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white transition-all border border-white/10">
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-outfit text-3xl font-black text-white w-10 text-center">{value}</span>
      <button onClick={() => onChange(Math.min(20, value + 1))}
        className="w-9 h-9 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-white transition-all border border-white/10">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
