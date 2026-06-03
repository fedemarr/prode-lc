import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  if (new Date() >= question.tournament.startsAt) {
    return NextResponse.json({ error: "El torneo ya comenzó, no se aceptan pronósticos especiales" }, { status: 400 });
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
