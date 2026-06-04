"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      style={{ background: "linear-gradient(145deg, #0F2570 0%, #1A3FA8 40%, #1E50CC 70%, #0F2570 100%)" }}>

      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border border-white/8" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border border-brand-yellow/10" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-brand-yellow/5" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-2xl border-4 border-white/40 mb-4">
            <Image src="/logo.png" alt="Club Los Cedros" width={96} height={96}
              className="object-contain w-[88%] h-[88%]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <h1 className="font-outfit text-3xl font-black text-white tracking-tight">ProdeClub</h1>
          <p className="text-white/60 text-sm mt-0.5">Club Los Cedros · Mundial 2026</p>
        </div>

        {/* Form card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow focus:bg-white/15 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow focus:bg-white/15 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-[#0F2570] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #F5C400, #FFD740)" }}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Ingresar
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              ¿No tenés cuenta?{" "}
              <Link href="/register" className="text-brand-yellow font-bold hover:text-brand-yellow-light transition-colors">
                Registrate
              </Link>
            </p>
          </div>
        </div>

        {/* Color strip */}
        <div className="flex mt-5 rounded-full overflow-hidden h-1 mx-8">
          <div className="flex-1 bg-brand-yellow" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-brand-blue-dark" />
        </div>
      </div>
    </div>
  );
}
