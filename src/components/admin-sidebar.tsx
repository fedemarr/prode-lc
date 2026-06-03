"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  Star,
  Download,
  LogOut,
  Shield,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/participants", label: "Participantes", icon: Users },
  { href: "/admin/matches", label: "Partidos", icon: Calendar },
  { href: "/admin/results", label: "Resultados", icon: Target },
  { href: "/admin/ranking", label: "Ranking", icon: Trophy },
  { href: "/admin/special", label: "Especiales", icon: Star },
  { href: "/admin/export", label: "Exportar", icon: Download },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-[#0D1421] border-r border-white/8 flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#00C27C]/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-[#00C27C]" />
        </div>
        <div>
          <p className="font-outfit font-bold text-sm text-white">Admin Panel</p>
          <p className="text-xs text-white/40">Club Los Cedros</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
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

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-all w-full"
      >
        <LogOut className="w-4 h-4" />
        Salir
      </button>
    </aside>
  );
}
