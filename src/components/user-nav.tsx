"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Trophy, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/matches", label: "Partidos", icon: Calendar },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/stats", label: "Stats", icon: BarChart2 },
  { href: "/profile", label: "Perfil", icon: User },
];

export function UserNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080C18]/95 backdrop-blur-md border-t border-white/8 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn("flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all",
                active ? "text-brand-yellow" : "text-white/35 hover:text-white/60")}>
              <Icon className={cn("w-5 h-5 flex-shrink-0", active && "drop-shadow-[0_0_8px_rgba(245,196,0,0.5)]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function UserSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[#0A1220] border-r border-white/6 p-4">
      <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl cedros-gradient flex items-center justify-center overflow-hidden flex-shrink-0">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
        <div>
          <p className="font-outfit font-bold text-sm text-white leading-tight">ProdeClub</p>
          <p className="text-[10px] text-white/40">Los Cedros · 2026</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-blue/20 text-brand-yellow border border-brand-blue/30"
                  : "text-white/45 hover:text-white hover:bg-white/5")}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="h-px bg-white/8 mb-3" />
        <Link href="/special"
          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/special"
              ? "bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30"
              : "text-brand-yellow/60 hover:text-brand-yellow hover:bg-brand-yellow/10")}>
          <Trophy className="w-4 h-4" />
          Pronósticos Especiales
        </Link>
      </div>
    </aside>
  );
}
