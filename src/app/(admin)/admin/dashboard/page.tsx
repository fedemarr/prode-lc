import { prisma } from "@/lib/prisma";
import { Users, Clock, Calendar, Trophy } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const [totalUsers, pendingUsers, todayMatches, nextMatch] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "USER", status: "PENDING" } }),
    prisma.match.count({
      where: {
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.match.findFirst({
      where: { status: "PENDING", scheduledAt: { gte: new Date() } },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { scheduledAt: "asc" },
    }),
  ]);

  const recentUsers = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, firstName: true, lastName: true, email: true, status: true, createdAt: true },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-white/50 text-sm mt-1">Panel de control — Prode Mundial 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard icon={<Users className="w-5 h-5 text-[#00C27C]" />} label="Participantes" value={totalUsers} color="green" />
        <KpiCard
          icon={<Clock className="w-5 h-5 text-[#FFB800]" />}
          label="Pendientes"
          value={pendingUsers}
          color="amber"
          href="/admin/participants?status=PENDING"
        />
        <KpiCard icon={<Calendar className="w-5 h-5 text-blue-400" />} label="Partidos hoy" value={todayMatches} color="blue" />
        <div className="bg-[#1A2235] border border-white/8 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
          <p className="font-outfit text-sm font-bold text-white">Próximo partido</p>
          {nextMatch ? (
            <p className="text-xs text-white/50 mt-1">
              {nextMatch.homeTeam.flag} vs {nextMatch.awayTeam.flag} · {formatDateTime(nextMatch.scheduledAt)}
            </p>
          ) : (
            <p className="text-xs text-white/30 mt-1">Sin datos</p>
          )}
        </div>
      </div>

      {/* Recent registrations */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-outfit font-semibold text-white">Últimos registros</h2>
          <Link href="/admin/participants" className="text-[#00C27C] text-sm hover:underline">
            Ver todos →
          </Link>
        </div>

        <div className="space-y-2">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-xs text-white/40">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">{formatDateTime(u.createdAt)}</span>
                <Badge
                  variant={
                    u.status === "APPROVED" ? "default" : u.status === "PENDING" ? "amber" : "destructive"
                  }
                  className="text-[10px]"
                >
                  {u.status === "APPROVED" ? "Aprobado" : u.status === "PENDING" ? "Pendiente" : "Rechazado"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  href?: string;
}) {
  const bg = {
    green: "border-[#00C27C]/20 bg-[#00C27C]/5",
    amber: "border-[#FFB800]/20 bg-[#FFB800]/5",
    blue: "border-blue-500/20 bg-blue-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
  }[color];

  const card = (
    <div className={`bg-[#1A2235] border rounded-xl p-4 ${bg} ${href ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <p className="font-outfit text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}
