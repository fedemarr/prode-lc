"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SpecialAnswerFormProps {
  questionId: string;
  currentAnswer: string;
}

export function SpecialAnswerForm({ questionId, currentAnswer }: SpecialAnswerFormProps) {
  const [answer, setAnswer] = useState(currentAnswer);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function save() {
    if (!answer.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/admin/special-questions/${questionId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    });

    setLoading(false);

    if (!res.ok) {
      toast({ title: "Error al guardar", variant: "destructive" });
      return;
    }

    toast({ title: "✓ Respuesta guardada y puntos asignados" });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Respuesta correcta..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="flex-1"
      />
      <Button onClick={save} disabled={loading || !answer.trim()} size="sm">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        )}
        <span className="ml-1">Resolver</span>
      </Button>
    </div>
  );
}
