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
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast({ title: "Email o contraseña incorrectos", variant: "destructive" });
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#080C18] flex flex-col md:flex-row">
      {/* Left panel — club branding */}
      <div className="hidden md:flex md:w-1/2 cedros-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full border border-white" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-2xl shadow-black/40 border-4 border-white/30">
            <Image
              src="/logo.png"
              alt="Club Los Cedros"
              width={120}
              height={120}
              className="object-contain w-[90%] h-[90%]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div>
            <h1 className="font-outfit text-4xl font-black text-white tracking-tight">ProdeClub</h1>
            <p className="text-white/70 mt-2 text-lg font-medium">Club Los Cedros</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 mt-4">
            <p className="text-brand-yellow font-outfit font-bold text-xl">🏆 Mundial 2026</p>
            <p className="text-white/60 text-sm mt-1">Estados Unidos · México · Canadá</p>
            <p className="text-white/60 text-sm">11 jun – 19 jul · 48 selecciones</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        {/* Mobile logo */}
        <div className="flex flex-col items-center mb-8 md:hidden">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden mb-3 shadow-xl border-4 border-brand-blue/40">
            <Image
              src="/logo.png"
              alt="Club Los Cedros"
              width={68}
              height={68}
              className="object-contain w-[85%] h-[85%]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <h1 className="font-outfit text-2xl font-black text-white">ProdeClub</h1>
          <p className="text-white/50 text-sm">Club Los Cedros · Mundial 2026</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-outfit text-3xl font-bold text-white">Bienvenido</h2>
            <p className="text-white/40 mt-1">Ingresá a tu cuenta del prode</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60 text-xs uppercase tracking-wider font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-10 bg-white/5 border-white/10 focus:border-brand-blue-light focus:ring-brand-blue/30 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60 text-xs uppercase tracking-wider font-semibold">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-10 bg-white/5 border-white/10 focus:border-brand-blue-light focus:ring-brand-blue/30 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 cedros-gradient hover:opacity-90 text-white font-semibold text-base border-0 shadow-lg shadow-brand-blue/30"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Ingresar
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/8 text-center">
            <p className="text-white/40 text-sm">
              ¿No tenés cuenta?{" "}
              <Link href="/register" className="text-brand-yellow hover:text-brand-yellow-light font-semibold transition-colors">
                Registrate
              </Link>
            </p>
          </div>

          {/* Decoration */}
          <div className="mt-8 flex items-center gap-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-brand-blue" />
            <div className="w-8 h-0.5 bg-brand-yellow" />
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-8 h-0.5 bg-brand-blue" />
            <div className="w-2 h-2 rounded-full bg-brand-yellow" />
          </div>
        </div>
      </div>
    </div>
  );
}
