import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Cierre de pronósticos especiales: fin de la fase de grupos
async function getSpecialDeadline(tournamentId: string): Promise<Date> {
  const lastGroupMatch = await prisma.match.findFirst({
    where: { tournamentId, phase: "GROUP" },
    orderBy: { scheduledAt: "desc" },
  });
  if (lastGroupMatch) {
    // Deadline: 3 horas después del último partido de grupos
    const deadline = new Date(lastGroupMatch.scheduledAt);
    deadline.setHours(deadline.getHours() + 3);
    return deadline;
  }
  // Fallback: 28 de junio 2026 23:59 UTC
  return new Date("2026-06-28T23:59:00.000Z");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { questionId, answer } = await req.json();

  const question = await prisma.specialQuestion.findUnique({
    where: { id: questionId },
    include: { tournament: true },
  });

  if (!question) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });

  const deadline = await getSpecialDeadline(question.tournamentId);
  if (new Date() >= deadline) {
    return NextResponse.json({ error: "El período de pronósticos especiales cerró al finalizar la fase de grupos" }, { status: 400 });
  }

  const prediction = await prisma.specialPrediction.upsert({
    where: { userId_questionId: { userId: session.user.id, questionId } },
    update: { answer: answer.trim() },
    create: {
      userId: session.user.id,
      questionId,
      answer: answer.trim(),
    },
  });

  return NextResponse.json(prediction);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const predictions = await prisma.specialPrediction.findMany({
    where: { userId: session.user.id },
    include: { question: true },
  });

  return NextResponse.json(predictions);
}
