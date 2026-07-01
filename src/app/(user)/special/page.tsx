export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SpecialForm } from "@/components/special-form";
import { Lock, Clock } from "lucide-react";

export default async function SpecialPage() {
  const session = await getServerSession(authOptions);

  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
  if (!tournament) return <div className="p-6 text-white/40">No hay torneo activo</div>;

  // Deadline: último partido de grupos + 3h
  const lastGroupMatch = await prisma.match.findFirst({
    where: { tournamentId: tournament.id, phase: "GROUP" },
    orderBy: { scheduledAt: "desc" },
  });
  const deadline = lastGroupMatch
    ? new Date(new Date(lastGroupMatch.scheduledAt).getTime() + 3 * 60 * 60 * 1000)
    : new Date("2026-06-28T23:59:00.000Z");

  const isOpen = new Date() < deadline;

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

  const deadlineStr = deadline.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto w-full">
      <div className="mb-5">
        <h1 className="font-outfit text-2xl font-bold text-white">Pronósticos Especiales</h1>
        <p className="text-white/40 text-sm mt-1">
          {isOpen
            ? `Abiertos hasta el fin de la fase de grupos (${deadlineStr})`
            : "Cerrados — la fase de grupos finalizó"}
        </p>
      </div>

      {isOpen ? (
        <div className="flex items-center gap-3 bg-brand-blue/15 border border-brand-blue/30 rounded-xl p-4 mb-5">
          <Clock className="w-5 h-5 text-brand-yellow flex-shrink-0" />
          <p className="text-sm text-white/80">
            Podés modificar tus respuestas hasta el <strong className="text-brand-yellow">fin de la fase de grupos ({deadlineStr})</strong>.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl p-4 mb-5">
          <Lock className="w-5 h-5 text-brand-yellow flex-shrink-0" />
          <p className="text-sm text-brand-yellow">
            Los pronósticos especiales cerraron al finalizar la fase de grupos.
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
