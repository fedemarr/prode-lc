import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const phase = searchParams.get("phase");
  const group = searchParams.get("group");

  const where: any = { tournamentId: params.id };
  if (phase) where.phase = phase;
  if (group) where.groupName = group;

  const matches = await prisma.match.findMany({
    where,
    include: {
      homeTeam: true,
      awayTeam: true,
      predictions: {
        where: { userId: session.user.id },
        select: { homeScore: true, awayScore: true, pointsEarned: true, resultType: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(matches);
}
