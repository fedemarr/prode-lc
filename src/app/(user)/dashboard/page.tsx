export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Trophy, Target, TrendingUp, Calendar, Swords, Gift, BookOpen, Ticket } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const [leaderboard, myPredictions, nextMatches, userInfo] = await Promise.all([
    tournament ? prisma.leaderboardEntry.findFirst({ where: { userId, tournamentId: tournament.id, phase: "total" } }) : null,
    tournament ? prisma.prediction.findMany({ where: { userId, tournamentId: tournament.id }, include: { match: true } }) : [],
    tournament ? prisma.match.findMany({
      where: { tournamentId: tournament.id, status: "PENDING", scheduledAt: { gte: new Date() } },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { scheduledAt: "asc" },
      take: 4,
    }) : [],
    prisma.user.findUnique({ where: { id: userId }, select: { chances: true } }),
  ]);

  const userChances = userInfo?.chances ?? 1;
  const totalPoints = leaderboard?.points ?? 0;
  const rankPosition = leaderboard?.rankPosition ?? 0;
  const exactHits = leaderboard?.exactHits ?? 0;
  const winnerHits = leaderboard?.winnerHits ?? 0;
  const totalHits = exactHits + winnerHits;
  const accuracy = myPredictions.length > 0 ? Math.round((totalHits / myPredictions.length) * 100) : 0;
  const userName = session!.user.name?.split(" ")[0] ?? "Jugador";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-5">
        <p className="text-white/40 text-sm">Bienvenido de vuelta</p>
        <h1 className="font-outfit text-2xl md:text-3xl font-bold text-white">{userName} 👋</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard icon={<Trophy className="w-5 h-5 text-brand-yellow" />} label="Puntos" value={totalPoints.toString()} bg="bg-brand-yellow/10 border-brand-yellow/20" text="text-brand-yellow" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} label="Posición" value={rankPosition > 0 ? `#${rankPosition}` : "-"} bg="bg-purple-500/10 border-purple-500/20" text="text-purple-300" />
        <StatCard icon={<Target className="w-5 h-5 text-brand-blue-light" />} label="% Aciertos" value={`${accuracy}%`} bg="bg-brand-blue/10 border-brand-blue/20" text="text-brand-blue-light" />
        <StatCard icon={<Ticket className="w-5 h-5 text-emerald-400" />} label="Mis chances" value={userChances.toString()} bg="bg-emerald-500/10 border-emerald-500/20" text="text-emerald-300" />
      </div>

      {/* Next matches */}
      <div className="bg-[#0F1A2E] border border-white/8 rounded-2xl p-4 md:p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-outfit font-semibold text-white text-sm md:text-base">Próximos partidos</h2>
          <Link href="/matches" className="text-brand-yellow text-xs md:text-sm hover:underline">Ver todos →</Link>
        </div>
        {nextMatches.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No hay partidos próximos</p>
        ) : (
          <div className="space-y-2">
            {nextMatches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/4 hover:bg-white/8 transition-all">
                  <span className="text-lg flex-shrink-0">{match.homeTeam.flag}</span>
                  <span className="text-xs font-medium text-white truncate flex-1 min-w-0">{match.homeTeam.name}</span>
                  <div className="text-center flex-shrink-0 px-1">
                    <p className="text-[10px] text-white/35 whitespace-nowrap">{formatDateTime(match.scheduledAt)}</p>
                  </div>
                  <span className="text-xs font-medium text-white truncate flex-1 min-w-0 text-right">{match.awayTeam.name}</span>
                  <span className="text-lg flex-shrink-0">{match.awayTeam.flag}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link href="/knockout" className="flex items-center gap-3 bg-[#0F1A2E] border border-brand-blue/20 rounded-xl p-4 hover:border-brand-blue/40 transition-all">
          <div className="w-9 h-9 rounded-xl cedros-gradient flex items-center justify-center flex-shrink-0">
            <Swords className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Fase Final</p>
            <p className="text-xs text-white/35 truncate">32avos → Final</p>
          </div>
        </Link>
        <Link href="/special" className="flex items-center gap-3 bg-[#0F1A2E] border border-brand-yellow/20 rounded-xl p-4 hover:border-brand-yellow/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-brand-yellow/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4 text-brand-yellow" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Especiales</p>
            <p className="text-xs text-white/35 truncate">Campeón, Goleador...</p>
          </div>
        </Link>
      </div>

      {/* Premios y Reglas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link href="/prizes" className="flex items-center gap-3 bg-[#0F1A2E] border border-brand-yellow/20 rounded-xl p-4 hover:border-brand-yellow/40 transition-all">
          <div className="w-9 h-9 rounded-xl bg-brand-yellow/20 flex items-center justify-center flex-shrink-0">
            <Gift className="w-4 h-4 text-brand-yellow" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Premios</p>
            <p className="text-xs text-white/35 truncate">Smart TV, Nespresso...</p>
          </div>
        </Link>
        <Link href="/rules" className="flex items-center gap-3 bg-[#0F1A2E] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
          <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-white/60" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Reglas</p>
            <p className="text-xs text-white/35 truncate">Puntos y mecánica</p>
          </div>
        </Link>
      </div>

      {/* Stats summary */}
      <div className="bg-[#0F1A2E] border border-white/8 rounded-2xl p-4 md:p-5">
        <h2 className="font-outfit font-semibold text-white text-sm md:text-base mb-4">Mis aciertos</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-brand-yellow/8 border border-brand-yellow/20 rounded-xl p-3">
            <p className="font-outfit text-2xl font-black text-brand-yellow">{exactHits}</p>
            <p className="text-[10px] text-white/40 mt-1">Exactos</p>
            <p className="text-[10px] text-brand-yellow/60 font-bold">+5 pts</p>
          </div>
          <div className="bg-brand-blue/8 border border-brand-blue/20 rounded-xl p-3">
            <p className="font-outfit text-2xl font-black text-brand-blue-light">{winnerHits}</p>
            <p className="text-[10px] text-white/40 mt-1">Resultado</p>
            <p className="text-[10px] text-brand-blue-light/60 font-bold">+2 pts</p>
          </div>
          <div className="bg-white/4 border border-white/8 rounded-xl p-3">
            <p className="font-outfit text-2xl font-black text-white/30">{myPredictions.length - totalHits}</p>
            <p className="text-[10px] text-white/40 mt-1">Fallados</p>
            <p className="text-[10px] text-white/20 font-bold">0 pts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, text }: { icon: React.ReactNode; label: string; value: string; bg: string; text: string }) {
  return (
    <div className={`rounded-xl border p-3 md:p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <p className={`font-outfit text-2xl md:text-3xl font-black ${text}`}>{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  );
}
