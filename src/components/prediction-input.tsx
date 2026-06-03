"use client";

import { useState } from "react";
import { Minus, Plus, Loader2, CheckCircle2 } from "lucide-react";
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
  disabled = false,
}: PredictionInputProps) {
  const { toast } = useToast();
  const [home, setHome] = useState(initialHome);
  const [away, setAway] = useState(initialAway);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const adjust = (setter: React.Dispatch<React.SetStateAction<number>>, delta: number) => {
    setter((v) => Math.max(0, Math.min(20, v + delta)));
    setSaved(false);
  };

  async function save() {
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
      return;
    }

    setSaved(true);
    toast({ title: "✓ Pronóstico guardado", description: `${homeTeamName} ${home} — ${away} ${awayTeamName}`, variant: "success" as any });
  }

  if (disabled) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
        <p className="text-white/40 text-sm">El período de pronóstico cerró</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-6 space-y-6">
      <h3 className="font-outfit font-semibold text-white text-center">Tu pronóstico</h3>

      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <span className="text-4xl">{homeFlag ?? "🏳️"}</span>
          <p className="text-xs text-white/60 text-center font-medium">{homeTeamName}</p>
          <ScoreControl value={home} onChange={(v) => { setHome(v); setSaved(false); }} />
        </div>

        {/* Divider */}
        <div className="text-white/20 text-2xl font-light pb-6">—</div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <span className="text-4xl">{awayFlag ?? "🏳️"}</span>
          <p className="text-xs text-white/60 text-center font-medium">{awayTeamName}</p>
          <ScoreControl value={away} onChange={(v) => { setAway(v); setSaved(false); }} />
        </div>
      </div>

      <Button onClick={save} disabled={loading} className="w-full" size="lg">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : saved ? (
          <CheckCircle2 className="w-4 h-4 mr-2 text-white" />
        ) : null}
        {saved ? "Guardado" : "Guardar pronóstico"}
      </Button>

      <p className="text-center text-xs text-white/30">
        Podés cambiar tu pronóstico hasta que el partido comience
      </p>
    </div>
  );
}

function ScoreControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-outfit text-3xl font-bold text-white w-10 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(20, value + 1))}
        className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
