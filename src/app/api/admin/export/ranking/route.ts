import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRankingExcel } from "@/lib/excel";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entries = await prisma.leaderboardEntry.findMany({
    where: { phase: "total" },
    include: { user: true },
    orderBy: [{ points: "desc" }, { exactHits: "desc" }],
  });

  const data = entries.map((e, i) => ({
    ...e,
    rankPosition: i + 1,
    userName: `${e.user.firstName} ${e.user.lastName}`,
    totalPredictions: e.exactHits + e.winnerHits,
  }));

  const buffer = await generateRankingExcel(data);

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="ranking-mundial-2026.xlsx"`,
    },
  });
}
