export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Target, Zap, TrendingUp } from "lucide-react";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const predictions = tournament
    ? await prisma.prediction.findMany({
        where: { userId, tournamentId: tournament.id, match: { status: "FINISHED" } },
        include: { match: { include: { homeTeam: true, awayTeam: true } } },
        orderBy: { match: { scheduledAt: "asc" } },
      })
    : [];

  const exact = predictions.filter((p) => p.resultType === "EXACT").length;
  const winner = predictions.filter((p) => p.resultType === "WINNER").length;
  const wrong = predictions.filter((p) => p.resultType === "WRONG").length;
  const total = predictions.length;
  const accuracy = total > 0 ? Math.round(((exact + winner) / total) * 100) : 0;
  const totalPoints = predictions.reduce((sum, p) => sum + (p.pointsEarned ?? 0), 0);

  // Streak
  let streak = 0;
  for (let i = predictions.length - 1; i >= 0; i--) {
    if (predictions[i].resultType !== "WRONG") streak++;
    else break;
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Mis Estadísticas</h1>
        <p className="text-white/50 text-sm mt-1">Rendimiento en el torneo</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatBox label="Total puntos" value={totalPoints} unit="pts" color="green" />
        <StatBox label="% Aciertos" value={accuracy} unit="%" color="blue" />
        <StatBox label="Racha actual" value={streak} unit="seguidos" color="amber" />
        <StatBox label="Exactos" value={exact} unit="pronósticos" color="green" />
        <StatBox label="Resultado" value={winner} unit="pronósticos" color="amber" />
        <StatBox label="Fallados" value={wrong} unit="pronósticos" color="red" />
      </div>

      {/* Pie-like breakdown */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-5 mb-4">
        <h2 className="font-outfit font-semibold text-white mb-4">Distribución de resultados</h2>
        {total === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">Sin datos todavía</p>
        ) : (
          <div className="space-y-3">
            <BarRow label="Exactos (5pts)" count={exact} total={total} color="#00C27C" />
            <BarRow label="Resultado (2pts)" count={winner} total={total} color="#FFB800" />
            <BarRow label="Fallados (0pts)" count={wrong} total={total} color="#FF453A" />
          </div>
        )}
      </div>

      {/* Recent predictions */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-5">
        <h2 className="font-outfit font-semibold text-white mb-4">Últimos pronósticos</h2>
        {predictions.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">Sin pronósticos finalizados</p>
        ) : (
          <div className="space-y-2">
            {predictions.slice(-8).reverse().map((pred) => (
              <div key={pred.id} className="flex items-center justify-between text-sm">
                <span className="text-white/60 truncate flex-1">
                  {pred.match.homeTeam.flag} {pred.match.homeTeam.name} vs {pred.match.awayTeam.name} {pred.match.awayTeam.flag}
                </span>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className="text-white/40 text-xs">
                    {pred.homeScore}–{pred.awayScore}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      pred.resultType === "EXACT" ? "text-[#00C27C]"
                      : pred.resultType === "WINNER" ? "text-[#FFB800]"
                      : "text-[#FF453A]"
                    }`}
                  >
                    +{pred.pointsEarned ?? 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  const c = { green: "text-[#00C27C]", blue: "text-blue-400", amber: "text-[#FFB800]", red: "text-[#FF453A]" }[color];
  return (
    <div className="bg-[#1A2235] border border-white/8 rounded-xl p-4">
      <p className={`font-outfit text-2xl font-bold ${c}`}>{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{unit}</p>
      <p className="text-xs text-white/60 mt-1">{label}</p>
    </div>
  );
}

function BarRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60">{label}</span>
        <span className="text-white/40">{count} ({pct}%)</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
