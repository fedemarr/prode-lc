import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { matchId, homeScore, awayScore } = await req.json();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  if (match.status !== "PENDING") {
    return NextResponse.json({ error: "El partido ya comenzó o finalizó" }, { status: 400 });
  }
  if (new Date() >= match.scheduledAt) {
    return NextResponse.json({ error: "El período de pronóstico cerró" }, { status: 400 });
  }

  const prediction = await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    update: { homeScore: Number(homeScore), awayScore: Number(awayScore) },
    create: {
      userId: session.user.id,
      matchId,
      tournamentId: match.tournamentId,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
    },
  });

  return NextResponse.json(prediction);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");

  const predictions = await prisma.prediction.findMany({
    where: { userId: session.user.id, ...(tournamentId ? { tournamentId } : {}) },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
    orderBy: { match: { scheduledAt: "asc" } },
  });

  return NextResponse.json(predictions);
}
