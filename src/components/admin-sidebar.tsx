"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Trophy, Star, Download, LogOut, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Image from "next/image";

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
    <aside className="w-60 min-h-screen bg-[#060A14] border-r border-white/6 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl cedros-gradient flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div>
            <p className="font-outfit font-bold text-sm text-white">Admin Panel</p>
            <p className="text-[10px] text-white/35">Club Los Cedros</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/30"
                  : "text-white/45 hover:text-white hover:bg-white/5")}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/6">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-brand-red hover:bg-brand-red/10 transition-all w-full">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
