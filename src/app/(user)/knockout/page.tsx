import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KnockoutBracket } from "@/components/knockout-bracket";

export default async function KnockoutPage() {
  const session = await getServerSession(authOptions);
  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
  if (!tournament) return <div className="p-6 text-white/40">No hay torneo activo</div>;

  const matches = await prisma.match.findMany({
    where: { tournamentId: tournament.id, phase: { not: "GROUP" } },
    include: {
      homeTeam: true,
      awayTeam: true,
      predictions: {
        where: { userId: session!.user.id },
        select: { homeScore: true, awayScore: true, pointsEarned: true, resultType: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const byPhase = {
    R32: matches.filter(m => m.phase === "R32"),
    R16: matches.filter(m => m.phase === "R16"),
    QF: matches.filter(m => m.phase === "QF"),
    SF: matches.filter(m => m.phase === "SF"),
    FINAL: matches.filter(m => m.phase === "FINAL"),
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="p-4 md:p-6 pb-2">
        <h1 className="font-outfit text-2xl font-bold text-white">Fase Final</h1>
        <p className="text-white/40 text-sm mt-1">
          Visualizá las llaves y cargá tus pronósticos desde los 32avos hasta la gran final.
        </p>
      </div>
      <KnockoutBracket byPhase={byPhase} userId={session!.user.id} />
    </div>
  );
}
