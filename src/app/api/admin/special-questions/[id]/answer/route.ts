import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { answer } = await req.json();

  const question = await prisma.specialQuestion.update({
    where: { id: params.id },
    data: { answer },
  });

  // Grade all predictions for this question
  const predictions = await prisma.specialPrediction.findMany({
    where: { questionId: params.id },
  });

  for (const pred of predictions) {
    const isCorrect = pred.answer.trim().toLowerCase() === answer.trim().toLowerCase();
    const pointsEarned = isCorrect ? question.points : 0;

    await prisma.specialPrediction.update({
      where: { id: pred.id },
      data: { isCorrect, pointsEarned },
    });

    if (isCorrect) {
      // Add points to leaderboard
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_tournamentId_phase: {
            userId: pred.userId,
            tournamentId: question.tournamentId,
            phase: "special",
          },
        },
        update: { points: { increment: pointsEarned } },
        create: {
          userId: pred.userId,
          tournamentId: question.tournamentId,
          phase: "special",
          points: pointsEarned,
        },
      });

      await prisma.leaderboardEntry.upsert({
        where: {
          userId_tournamentId_phase: {
            userId: pred.userId,
            tournamentId: question.tournamentId,
            phase: "total",
          },
        },
        update: { points: { increment: pointsEarned } },
        create: {
          userId: pred.userId,
          tournamentId: question.tournamentId,
          phase: "total",
          points: pointsEarned,
        },
      });
    }
  }

  return NextResponse.json({ success: true, question });
}
