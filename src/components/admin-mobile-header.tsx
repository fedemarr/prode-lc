"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, Calendar, Trophy, Star, Download, Target, LogOut, ClipboardList } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/participants", label: "Participantes", icon: Users },
  { href: "/admin/matches", label: "Partidos", icon: Calendar },
  { href: "/admin/results", label: "Resultados", icon: Target },
  { href: "/admin/votes", label: "Registro Votos", icon: ClipboardList },
  { href: "/admin/ranking", label: "Ranking", icon: Trophy },
  { href: "/admin/special", label: "Especiales", icon: Star },
  { href: "/admin/export", label: "Exportar", icon: Download },
];

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="h-16 bg-[#060A14]/95 backdrop-blur-md border-b border-white/6 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg cedros-gradient flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="object-contain w-[85%] h-[85%]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <span className="font-outfit font-bold text-white text-sm">Admin Panel</span>
        </div>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-white transition-all">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-72 h-full bg-[#060A14] border-l border-white/8 flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-outfit font-bold text-white">Menú Admin</span>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                      active ? "bg-brand-blue text-white" : "text-white/50 hover:text-white hover:bg-white/8")}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <button onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}
