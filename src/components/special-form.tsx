"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SpecialFormProps {
  questionId: string;
  question: string;
  points: number;
  savedAnswer: string | null;
  isCorrect: boolean | null;
  pointsEarned: number | null;
  isOpen: boolean;
}

export function SpecialForm({
  questionId,
  question,
  points,
  savedAnswer,
  isCorrect,
  pointsEarned,
  isOpen,
}: SpecialFormProps) {
  const { toast } = useToast();
  const [answer, setAnswer] = useState(savedAnswer ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(!!savedAnswer);

  async function save() {
    if (!answer.trim()) return;
    setLoading(true);

    const res = await fetch("/api/special-predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Error", description: data.error, variant: "destructive" });
      return;
    }

    setSaved(true);
    toast({ title: "Guardado ✓", description: question });
  }

  const resolved = isCorrect !== null;

  return (
    <div className={cn(
      "bg-[#1A2235] border rounded-xl p-4",
      resolved
        ? isCorrect ? "border-[#00C27C]/30" : "border-[#FF453A]/20"
        : "border-white/8"
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-medium text-white leading-snug">{question}</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="w-3 h-3 text-[#FFB800]" />
          <span className="text-xs font-bold text-[#FFB800]">{points}pts</span>
        </div>
      </div>

      {resolved ? (
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg",
          isCorrect ? "bg-[#00C27C]/10" : "bg-white/5"
        )}>
          <div>
            <p className="text-xs text-white/40">Tu respuesta</p>
            <p className="text-sm font-medium text-white mt-0.5">{savedAnswer}</p>
          </div>
          <div className="text-right">
            <p className={cn("font-bold", isCorrect ? "text-[#00C27C]" : "text-[#FF453A]")}>
              {isCorrect ? `+${pointsEarned}pts` : "0pts"}
            </p>
            <p className="text-xs text-white/40">{isCorrect ? "Correcto ✓" : "Incorrecto ✗"}</p>
          </div>
        </div>
      ) : isOpen ? (
        <div className="flex gap-2">
          <Input
            placeholder="Tu respuesta..."
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setSaved(false); }}
            className="flex-1"
          />
          <Button onClick={save} disabled={loading || !answer.trim()} size="sm">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle2 className="w-3 h-3" /> : "Guardar"}
          </Button>
        </div>
      ) : savedAnswer ? (
        <div className="bg-white/5 p-3 rounded-lg">
          <p className="text-xs text-white/40">Tu respuesta</p>
          <p className="text-sm text-white mt-0.5">{savedAnswer}</p>
          <p className="text-xs text-white/30 mt-1">Esperando resolución...</p>
        </div>
      ) : (
        <p className="text-xs text-white/30 italic">Sin respuesta</p>
      )}
    </div>
  );
}
