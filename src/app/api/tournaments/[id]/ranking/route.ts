import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const phase = searchParams.get("phase") || "total";

  const entries = await prisma.leaderboardEntry.findMany({
    where: { tournamentId: params.id, phase },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }],
  });

  return NextResponse.json(
    entries.map((e, i) => ({
      ...e,
      rankPosition: i + 1,
      userName: `${e.user.firstName} ${e.user.lastName}`,
    }))
  );
}
