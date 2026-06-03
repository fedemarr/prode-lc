"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Trophy, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0E1A]/95 backdrop-blur-md border-t border-white/8 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0",
                active ? "text-[#00C27C]" : "text-white/40 hover:text-white/70"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", active && "drop-shadow-[0_0_8px_rgba(0,194,124,0.6)]")} />
              <span className="text-[10px] font-medium truncate">{label}</span>
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
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[#0D1421] border-r border-white/8 p-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#00C27C]/20 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-[#00C27C]" />
        </div>
        <div>
          <p className="font-outfit font-bold text-sm text-white">ProdeClub</p>
          <p className="text-xs text-white/40">Mundial 2026</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[#00C27C]/15 text-[#00C27C] border border-[#00C27C]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
