import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const [leaderboard, myPredictions, nextMatches] = await Promise.all([
    tournament
      ? prisma.leaderboardEntry.findFirst({
          where: { userId, tournamentId: tournament.id, phase: "total" },
        })
      : null,
    tournament
      ? prisma.prediction.findMany({
          where: { userId, tournamentId: tournament.id },
          include: { match: true },
        })
      : [],
    tournament
      ? prisma.match.findMany({
          where: {
            tournamentId: tournament.id,
            status: "PENDING",
            scheduledAt: { gte: new Date() },
          },
          include: { homeTeam: true, awayTeam: true },
          orderBy: { scheduledAt: "asc" },
          take: 4,
        })
      : [],
  ]);

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
      <div className="mb-6">
        <p className="text-white/50 text-sm">Bienvenido de vuelta</p>
        <h1 className="font-outfit text-2xl font-bold text-white">{userName} 👋</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Trophy className="w-5 h-5 text-[#00C27C]" />}
          label="Puntos"
          value={totalPoints.toString()}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          label="Posición"
          value={rankPosition > 0 ? `#${rankPosition}` : "-"}
          color="purple"
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-[#FFB800]" />}
          label="% Aciertos"
          value={`${accuracy}%`}
          color="amber"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-blue-400" />}
          label="Pronósticos"
          value={myPredictions.length.toString()}
          color="blue"
        />
      </div>

      {/* Next matches */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-outfit font-semibold text-white">Próximos partidos</h2>
          <Link href="/matches" className="text-[#00C27C] text-sm hover:underline">
            Ver todos →
          </Link>
        </div>

        {nextMatches.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">No hay partidos próximos</p>
        ) : (
          <div className="space-y-3">
            {nextMatches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-all group">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">{match.homeTeam.flag}</span>
                    <span className="text-sm font-medium text-white truncate">{match.homeTeam.name}</span>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-xs text-white/40 whitespace-nowrap">
                      {formatDateTime(match.scheduledAt)}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {match.roundLabel.split(" - ")[0]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-sm font-medium text-white truncate text-right">{match.awayTeam.name}</span>
                    <span className="text-lg">{match.awayTeam.flag}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats summary */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-5">
        <h2 className="font-outfit font-semibold text-white mb-4">Mis aciertos</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-[#00C27C] font-outfit">{exactHits}</p>
            <p className="text-xs text-white/40 mt-1">Exactos (5pts)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#FFB800] font-outfit">{winnerHits}</p>
            <p className="text-xs text-white/40 mt-1">Resultado (2pts)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white/30 font-outfit">
              {myPredictions.length - totalHits}
            </p>
            <p className="text-xs text-white/40 mt-1">Fallados (0pts)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const bg = {
    green: "bg-[#00C27C]/10 border-[#00C27C]/20",
    purple: "bg-purple-500/10 border-purple-500/20",
    amber: "bg-[#FFB800]/10 border-[#FFB800]/20",
    blue: "bg-blue-500/10 border-blue-500/20",
  }[color];

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
      </div>
      <p className="font-outfit text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50 mt-0.5">{label}</p>
    </div>
  );
}
