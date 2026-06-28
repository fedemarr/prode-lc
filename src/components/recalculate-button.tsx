"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function RecalculateButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function recalculate() {
    if (!confirm("¿Recalcular ranking completo desde cero para todos los usuarios?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/recalculate", { method: "POST" });
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* non-JSON response */ }

      if (!res.ok) {
        toast({ title: "Error al recalcular", description: (data?.error as string) ?? "Error interno", variant: "destructive" });
        return;
      }

      toast({
        title: "✓ Ranking recalculado",
        description: `${data.matchesProcessed} partidos · ${data.totalPredictions} pronósticos · ${data.usersUpdated} usuarios`,
      });
      router.refresh();
    } catch {
      toast({ title: "Error al recalcular", description: "No se pudo conectar al servidor", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={recalculate}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 bg-brand-blue/20 hover:bg-brand-blue/40 border border-brand-blue/30 rounded-lg text-sm text-brand-blue-light transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
      Recalcular ranking
    </button>
  );
}
