"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Loader2 } from "lucide-react";
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
      toast({ title: "Error", description: "Email o contraseña incorrectos", variant: "destructive" });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Logo */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00C27C]/20 border border-[#00C27C]/30 mb-4">
          <Trophy className="w-8 h-8 text-[#00C27C]" />
        </div>
        <h1 className="font-outfit text-3xl font-bold text-white">ProdeClub</h1>
        <p className="text-white/50 mt-1">Mundial 2026 · Club Los Cedros</p>
      </div>

      {/* Card */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-8 space-y-6">
        <div>
          <h2 className="font-outfit text-xl font-semibold text-white">Ingresar</h2>
          <p className="text-white/50 text-sm mt-1">Usá tu cuenta del prode</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Ingresar
          </Button>
        </form>

        <p className="text-center text-sm text-white/50">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-[#00C27C] hover:underline font-medium">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
