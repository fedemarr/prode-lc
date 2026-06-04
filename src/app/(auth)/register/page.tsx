"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, User, Mail, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast({ title: data.error, variant: "destructive" });
      return;
    }
    router.push("/login?registered=1");
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-[#080C18] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl cedros-gradient border border-brand-blue-light/40 flex items-center justify-center overflow-hidden mb-4">
            <Image src="/logo.png" alt="Club Los Cedros" width={56} height={56} className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <h1 className="font-outfit text-2xl font-black text-white">Crear cuenta</h1>
          <p className="text-white/40 text-sm mt-1">Prode Mundial 2026 · Club Los Cedros</p>
        </div>

        <div className="bg-[#0F1A2E] border border-white/8 rounded-2xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <Input placeholder="Juan" value={form.firstName} onChange={set("firstName")}
                    className="pl-9 bg-white/5 border-white/10 h-11" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Apellido</Label>
                <Input placeholder="Pérez" value={form.lastName} onChange={set("lastName")}
                  className="bg-white/5 border-white/10 h-11" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs uppercase tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <Input type="email" placeholder="tu@email.com" value={form.email} onChange={set("email")}
                  className="pl-9 bg-white/5 border-white/10 h-11" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs uppercase tracking-wider">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <Input type="tel" placeholder="11 1234 5678" value={form.phone} onChange={set("phone")}
                  className="pl-9 bg-white/5 border-white/10 h-11" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <Input type="password" placeholder="Min. 6 caracteres" value={form.password} onChange={set("password")}
                    className="pl-9 bg-white/5 border-white/10 h-11" required minLength={6} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Confirmar</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <Input type="password" placeholder="Repetir" value={form.confirmPassword} onChange={set("confirmPassword")}
                    className="pl-9 bg-white/5 border-white/10 h-11" required />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full h-11 cedros-gradient hover:opacity-90 text-white font-semibold border-0 shadow-lg shadow-brand-blue/25 mt-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Registrarme
            </Button>
          </form>

          <p className="text-center text-sm text-white/40 pt-2 border-t border-white/8">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-brand-yellow hover:text-brand-yellow-light font-semibold">Ingresar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
