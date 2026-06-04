"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Lock, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) { toast({ title: "Email o contraseña incorrectos", variant: "destructive" }); return; }
    router.push("/"); router.refresh();
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1565C0 0%, #1976D2 30%, #2196F3 60%, #1565C0 100%)" }}>

      {/* Decorative circles — same effect as the panel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full border-2 border-white/10" />
        <div className="absolute -top-20 -left-20 w-[350px] h-[350px] rounded-full border border-white/8" />
        <div className="absolute top-1/4 -right-32 w-[400px] h-[400px] rounded-full border-2 border-white/10" />
        <div className="absolute -bottom-40 left-1/4 w-[450px] h-[450px] rounded-full border border-white/8" />
        <div className="absolute bottom-1/3 -right-20 w-[250px] h-[250px] rounded-full border border-brand-yellow/15" />
        <div className="absolute top-1/2 left-1/3 w-[180px] h-[180px] rounded-full bg-white/4" />
        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #42A5F5 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #F5C400 0%, transparent 70%)" }} />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[360px] mx-4">
        {/* Logo — BIG */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-40 h-40 rounded-full overflow-hidden mb-4"
            style={{ boxShadow: "0 0 0 4px rgba(255,255,255,0.25), 0 0 0 8px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.35)" }}>
            <Image src="/logo.png" alt="Club Los Cedros" width={160} height={160}
              className="w-full h-full object-cover" priority
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <h1 className="font-outfit text-4xl font-black text-white tracking-tight drop-shadow-lg">ProdeClub</h1>
          <p className="text-white/70 text-sm mt-1 font-medium">Club Los Cedros · Mundial 2026</p>
          <div className="flex gap-1.5 mt-2.5">
            <span className="w-6 h-1 rounded-full bg-brand-yellow" />
            <span className="w-6 h-1 rounded-full bg-white/60" />
            <span className="w-6 h-1 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/12 backdrop-blur-2xl border border-white/25 rounded-3xl p-6 shadow-2xl"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs font-bold uppercase tracking-widest">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input type="email" placeholder="tu@email.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-brand-yellow/80 focus:bg-white/18 transition-all text-sm font-medium" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/80 text-xs font-bold uppercase tracking-widest">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-brand-yellow/80 focus:bg-white/18 transition-all text-sm font-medium" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl font-black text-base tracking-wide disabled:opacity-60 flex items-center justify-center gap-2 mt-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #F5C400 0%, #FFD740 100%)", color: "#0F2570", boxShadow: "0 4px 20px rgba(245,196,0,0.35)" }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Ingresar
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/12 text-center">
            <p className="text-white/55 text-sm">
              ¿No tenés cuenta?{" "}
              <Link href="/register" className="text-brand-yellow font-black hover:text-white transition-colors">
                Registrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
