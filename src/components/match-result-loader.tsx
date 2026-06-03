"use client";

import { useState } from "react";
import { Loader2, CheckSquare, Play, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MatchResultLoaderProps {
  matchId: string;
  currentStatus: string;
  currentHomeScore: number | null;
  currentAwayScore: number | null;
}

export function MatchResultLoader({
  matchId,
  currentStatus,
  currentHomeScore,
  currentAwayScore,
}: MatchResultLoaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
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
    toast({ title: "Partido marcado como EN VIVO" });
    router.refresh();
  }

  async function saveResult() {
    setLoading(true);
    const res = await fetch(`/api/admin/matches/${matchId}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeScore: Number(home),
        awayScore: Number(away),
        status: "FINISHED",
      }),
    });
    setLoading(false);

    if (!res.ok) {
      toast({ title: "Error al guardar resultado", variant: "destructive" });
      return;
    }

    toast({ title: "✓ Resultado guardado · Puntos calculados" });
    setEditing(false);
    router.refresh();
  }

  if (currentStatus === "FINISHED" && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 ml-2"
      >
        <Edit2 className="w-3 h-3" /> Corregir
      </button>
    );
  }

  if (editing || currentStatus === "LIVE") {
    return (
      <div className="flex items-center gap-1 ml-2">
        <Input
          value={home}
          onChange={(e) => setHome(e.target.value)}
          className="w-12 h-7 text-center text-xs px-1"
          type="number"
          min="0"
        />
        <span className="text-white/30">-</span>
        <Input
          value={away}
          onChange={(e) => setAway(e.target.value)}
          className="w-12 h-7 text-center text-xs px-1"
          type="number"
          min="0"
        />
        <Button size="sm" onClick={saveResult} disabled={loading} className="h-7 px-2">
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckSquare className="w-3 h-3" />}
        </Button>
        {editing && (
          <button onClick={() => setEditing(false)} className="text-xs text-white/30 hover:text-white/60 ml-1">
            ✕
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 ml-2">
      <button
        onClick={setLive}
        disabled={loading}
        className="h-7 px-2 rounded-lg bg-[#FF453A]/20 hover:bg-[#FF453A]/40 text-[#FF453A] text-xs flex items-center gap-1 transition-all"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
        Live
      </button>
      <button
        onClick={() => setEditing(true)}
        className="h-7 px-2 rounded-lg bg-[#00C27C]/20 hover:bg-[#00C27C]/40 text-[#00C27C] text-xs flex items-center gap-1 transition-all"
      >
        <CheckSquare className="w-3 h-3" />
        Fin
      </button>
    </div>
  );
}
