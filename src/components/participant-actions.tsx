"use client";

import { useState } from "react";
import { Check, X, MessageCircle, Loader2, Ticket, Minus, Plus, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ParticipantActionsProps {
  participantId: string;
  status: string;
  phone: string;
  name: string;
  chances: number;
}

export function ParticipantActions({ participantId, status, phone, name, chances: initialChances }: ParticipantActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [chances, setChances] = useState(initialChances);
  const [chancesLoading, setChancesLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  async function updateChances(newChances: number) {
    setChancesLoading(true);
    const res = await fetch(`/api/admin/participants/${participantId}/chances`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chances: newChances }),
    });
    setChancesLoading(false);

    if (!res.ok) {
      toast({ title: "Error", description: "No se pudo actualizar las chances", variant: "destructive" });
      return;
    }

    setChances(newChances);
    toast({ title: `✓ ${name} ahora tiene ${newChances} chance${newChances !== 1 ? "s" : ""}` });
  }

  async function savePassword() {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Mínimo 6 caracteres", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    const res = await fetch(`/api/admin/participants/${participantId}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setPasswordLoading(false);

    if (!res.ok) {
      toast({ title: "Error", description: "No se pudo cambiar la contraseña", variant: "destructive" });
      return;
    }

    toast({ title: `✓ Contraseña de ${name} actualizada` });
    setNewPassword("");
    setShowPasswordForm(false);
  }

  const waNumber = phone.replace(/\D/g, "");

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      {/* Chances editor */}
      <div className="flex items-center gap-1 bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg px-1.5 py-1">
        <Ticket className="w-3 h-3 text-brand-yellow flex-shrink-0" />
        <button
          onClick={() => chances > 1 && updateChances(chances - 1)}
          disabled={chancesLoading || chances <= 1}
          className="w-5 h-5 flex items-center justify-center text-brand-yellow hover:text-white disabled:opacity-30 transition-all"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="font-outfit font-black text-sm text-brand-yellow w-4 text-center tabular-nums">
          {chancesLoading ? "…" : chances}
        </span>
        <button
          onClick={() => chances < 10 && updateChances(chances + 1)}
          disabled={chancesLoading || chances >= 10}
          className="w-5 h-5 flex items-center justify-center text-brand-yellow hover:text-white disabled:opacity-30 transition-all"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Password change */}
      {showPasswordForm ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nueva contraseña"
            autoFocus
            className="w-32 h-8 px-2 text-xs bg-[#0F1A2E] border border-brand-blue/40 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-brand-blue"
          />
          <button
            onClick={savePassword}
            disabled={passwordLoading}
            className="w-8 h-8 rounded-lg bg-brand-blue/20 hover:bg-brand-blue/40 text-brand-blue-light flex items-center justify-center transition-all disabled:opacity-50"
          >
            {passwordLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => { setShowPasswordForm(false); setNewPassword(""); }}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPasswordForm(true)}
          title="Cambiar contraseña"
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all"
        >
          <KeyRound className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Status actions */}
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
