"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, User, Mail, Phone, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast({ title: "Las contraseñas no coinciden", variant: "destructive" }); return; }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast({ title: data.error, variant: "destructive" }); return; }
    router.push("/login?registered=1");
  }

  const field = (icon: React.ReactNode, placeholder: string, value: string, onChange: (v: string) => void, type = "text", required = true) => (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow focus:bg-white/15 transition-all text-sm" />
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0F2570 0%, #1A3FA8 40%, #1E50CC 70%, #0F2570 100%)" }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/8" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-white/8" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-5">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-white/30 mb-3">
            <Image src="/logo.png" alt="Club Los Cedros" width={68} height={68} className="object-contain w-[85%] h-[85%]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <h1 className="font-outfit text-2xl font-black text-white">Crear cuenta</h1>
          <p className="text-white/50 text-xs mt-0.5">Prode Mundial 2026 · Club Los Cedros</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white/60 text-[10px] uppercase tracking-wider mb-1 block">Nombre</Label>
                {field(<User className="w-3.5 h-3.5" />, "Juan", form.firstName, (v) => setForm(f => ({ ...f, firstName: v })))}
              </div>
              <div>
                <Label className="text-white/60 text-[10px] uppercase tracking-wider mb-1 block">Apellido</Label>
                {field(<User className="w-3.5 h-3.5" />, "Pérez", form.lastName, (v) => setForm(f => ({ ...f, lastName: v })))}
              </div>
            </div>

            <div>
              <Label className="text-white/60 text-[10px] uppercase tracking-wider mb-1 block">Email</Label>
              {field(<Mail className="w-3.5 h-3.5" />, "tu@email.com", form.email, (v) => setForm(f => ({ ...f, email: v })), "email")}
            </div>

            <div>
              <Label className="text-white/60 text-[10px] uppercase tracking-wider mb-1 block">Teléfono</Label>
              {field(<Phone className="w-3.5 h-3.5" />, "11 1234 5678", form.phone, (v) => setForm(f => ({ ...f, phone: v })), "tel")}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white/60 text-[10px] uppercase tracking-wider mb-1 block">Contraseña</Label>
                {field(<Lock className="w-3.5 h-3.5" />, "Mín. 6", form.password, (v) => setForm(f => ({ ...f, password: v })), "password")}
              </div>
              <div>
                <Label className="text-white/60 text-[10px] uppercase tracking-wider mb-1 block">Confirmar</Label>
                {field(<Lock className="w-3.5 h-3.5" />, "Repetir", form.confirmPassword, (v) => setForm(f => ({ ...f, confirmPassword: v })), "password")}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl font-bold text-[#0F2570] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg mt-1"
              style={{ background: "linear-gradient(135deg, #F5C400, #FFD740)" }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Registrarme
            </button>
          </form>

          <div className="pt-3 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-brand-yellow font-bold hover:text-brand-yellow-light">Ingresar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
