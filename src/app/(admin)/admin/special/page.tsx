import { prisma } from "@/lib/prisma";
import { SpecialAnswerForm } from "@/components/special-answer-form";
import { Badge } from "@/components/ui/badge";

export default async function AdminSpecialPage() {
  const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });

  const questions = tournament
    ? await prisma.specialQuestion.findMany({
        where: { tournamentId: tournament.id },
        orderBy: { orderIndex: "asc" },
        include: {
          predictions: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      })
    : [];

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Pronósticos Especiales</h1>
        <p className="text-white/50 text-sm mt-1">Gestión de preguntas y respuestas</p>
      </div>

      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="bg-[#1A2235] border border-white/8 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-medium text-white">{q.question}</h3>
                <p className="text-xs text-white/40 mt-1">{q.predictions.length} respuestas · {q.points} pts</p>
              </div>
              {q.answer ? (
                <Badge variant="default" className="flex-shrink-0">
                  Resuelta: {q.answer}
                </Badge>
              ) : (
                <Badge variant="outline" className="flex-shrink-0">Pendiente</Badge>
              )}
            </div>

            {/* Admin answer form */}
            <SpecialAnswerForm questionId={q.id} currentAnswer={q.answer ?? ""} />

            {/* Participants' answers */}
            {q.predictions.length > 0 && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="text-xs text-white/40 mb-2">Respuestas de participantes:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {q.predictions.map((pred) => (
                    <div
                      key={pred.id}
                      className={`text-xs p-2 rounded-lg border ${
                        pred.isCorrect === true
                          ? "border-[#00C27C]/30 bg-[#00C27C]/10"
                          : pred.isCorrect === false
                          ? "border-[#FF453A]/20 bg-[#FF453A]/5"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <p className="text-white/60">{pred.user.firstName} {pred.user.lastName}</p>
                      <p className="text-white font-medium mt-0.5">{pred.answer}</p>
                      {pred.pointsEarned !== null && (
                        <p className={`mt-0.5 font-bold ${pred.isCorrect ? "text-[#00C27C]" : "text-white/30"}`}>
                          +{pred.pointsEarned}pts
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
