import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SpecialForm } from "@/components/special-form";
import { Lock } from "lucide-react";

export default async function SpecialPage() {
  const session = await getServerSession(authOptions);

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
  if (!tournament) return <div className="p-6 text-white/40">No hay torneo activo</div>;

  const questions = await prisma.specialQuestion.findMany({
    where: { tournamentId: tournament.id },
    orderBy: { orderIndex: "asc" },
    include: {
      predictions: {
        where: { userId: session!.user.id },
        select: { answer: true, isCorrect: true, pointsEarned: true },
      },
    },
  });

  const isOpen = new Date() < tournament.startsAt;

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Pronósticos Especiales</h1>
        <p className="text-white/50 text-sm mt-1">
          {isOpen
            ? `Disponibles hasta el inicio del torneo (11/06/2026)`
            : "El torneo ya comenzó — pronósticos especiales cerrados"}
        </p>
      </div>

      {!isOpen && (
        <div className="flex items-center gap-3 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-xl p-4 mb-6">
          <Lock className="w-5 h-5 text-[#FFB800] flex-shrink-0" />
          <p className="text-sm text-[#FFB800]">
            El período de pronósticos especiales cerró con el inicio del torneo.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <SpecialForm
            key={q.id}
            questionId={q.id}
            question={q.question}
            points={q.points}
            savedAnswer={q.predictions[0]?.answer ?? null}
            isCorrect={q.predictions[0]?.isCorrect ?? null}
            pointsEarned={q.predictions[0]?.pointsEarned ?? null}
            isOpen={isOpen}
          />
        ))}
      </div>
    </div>
  );
}
