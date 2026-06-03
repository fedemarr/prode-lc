"use client";

import { useState } from "react";
import { Check, X, MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ParticipantActionsProps {
  participantId: string;
  status: string;
  phone: string;
  name: string;
}

export function ParticipantActions({ participantId, status, phone, name }: ParticipantActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: "APPROVED" | "REJECTED") {
    setLoading(newStatus);
    const res = await fetch(`/api/admin/participants/${participantId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(null);

    if (!res.ok) {
      toast({ title: "Error", description: "No se pudo actualizar el estado", variant: "destructive" });
      return;
    }

    toast({
      title: newStatus === "APPROVED" ? "✓ Aprobado" : "✕ Rechazado",
      description: `${name} fue ${newStatus === "APPROVED" ? "aprobado" : "rechazado"}`,
    });
    router.refresh();
  }

  const waNumber = phone.replace(/\D/g, "");

  return (
    <div className="flex items-center justify-end gap-1">
      {status !== "APPROVED" && (
        <button
          onClick={() => updateStatus("APPROVED")}
          disabled={!!loading}
          title="Aprobar"
          className="w-8 h-8 rounded-lg bg-[#00C27C]/20 hover:bg-[#00C27C]/40 text-[#00C27C] flex items-center justify-center transition-all disabled:opacity-50"
        >
          {loading === "APPROVED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          onClick={() => updateStatus("REJECTED")}
          disabled={!!loading}
          title="Rechazar"
          className="w-8 h-8 rounded-lg bg-[#FF453A]/20 hover:bg-[#FF453A]/40 text-[#FF453A] flex items-center justify-center transition-all disabled:opacity-50"
        >
          {loading === "REJECTED" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
        </button>
      )}
      <a
        href={`https://wa.me/54${waNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
        className="w-8 h-8 rounded-lg bg-green-600/20 hover:bg-green-600/40 text-green-400 flex items-center justify-center transition-all"
      >
        <MessageCircle className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
