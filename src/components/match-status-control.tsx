"use client";

import { useState } from "react";
import { Loader2, Play, CheckSquare, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MatchStatusControlProps {
  matchId: string;
  currentStatus: string;
  currentHomeScore: number | null;
  currentAwayScore: number | null;
}

export function MatchStatusControl({
  matchId,
  currentStatus,
  currentHomeScore,
  currentAwayScore,
}: MatchStatusControlProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [home, setHome] = useState(currentHomeScore?.toString() ?? "0");
  const [away, setAway] = useState(currentAwayScore?.toString() ?? "0");

  async function setLive() {
    setLoading(true);
    await fetch(`/api/admin/matches/${matchId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "LIVE" }),
    });
    setLoading(false);
    toast({ title: "Partido EN VIVO" });
    router.refresh();
  }

  async function saveResult() {
    setLoading(true);
    const res = await fetch(`/api/admin/matches/${matchId}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeScore: Number(home), awayScore: Number(away), status: "FINISHED" }),
    });
    setLoading(false);

    if (!res.ok) {
      toast({ title: "Error", variant: "destructive" });
      return;
    }

    toast({ title: "✓ Resultado guardado y puntos calculados" });
    setShowResult(false);
    router.refresh();
  }

  if (currentStatus === "FINISHED" && !showResult) {
    return (
      <button
        onClick={() => setShowResult(true)}
        className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1"
      >
        <Edit2 className="w-3 h-3" />
        Editar
      </button>
    );
  }

  if (showResult || currentStatus === "LIVE") {
    return (
      <div className="flex items-center gap-1">
        <Input
          className="w-12 h-7 text-center text-xs px-1"
          value={home}
          onChange={(e) => setHome(e.target.value)}
          type="number"
          min="0"
          max="20"
        />
        <span className="text-white/40">-</span>
        <Input
          className="w-12 h-7 text-center text-xs px-1"
          value={away}
          onChange={(e) => setAway(e.target.value)}
          type="number"
          min="0"
          max="20"
        />
        <Button size="sm" onClick={saveResult} disabled={loading} className="h-7 px-2 text-xs">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckSquare className="w-3 h-3" />}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={setLive}
        disabled={loading}
        title="Marcar como En Vivo"
        className="h-7 px-2 rounded-lg bg-[#FF453A]/20 hover:bg-[#FF453A]/40 text-[#FF453A] text-xs flex items-center gap-1 transition-all"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        Live
      </button>
      <button
        onClick={() => setShowResult(true)}
        title="Cargar resultado"
        className="h-7 px-2 rounded-lg bg-[#00C27C]/20 hover:bg-[#00C27C]/40 text-[#00C27C] text-xs flex items-center gap-1 transition-all"
      >
        <CheckSquare className="w-3 h-3" />
        Resultado
      </button>
    </div>
  );
}
