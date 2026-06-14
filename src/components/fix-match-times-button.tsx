"use client";

import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function FixMatchTimesButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function fixTimes() {
    if (!confirm("¿Actualizar todos los horarios de la fase de grupos al horario correcto de Argentina?")) return;
    setLoading(true);
    const res = await fetch("/api/admin/fix-match-times", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast({ title: "Error", description: data?.error ?? "Error interno", variant: "destructive" });
      return;
    }

    toast({ title: "✓ Horarios actualizados", description: `${data.updated} partidos actualizados` });
    router.refresh();
  }

  return (
    <button
      onClick={fixTimes}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 bg-brand-blue/20 hover:bg-brand-blue/40 border border-brand-blue/30 rounded-lg text-sm text-brand-blue-light transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
      Corregir horarios AR
    </button>
  );
}
