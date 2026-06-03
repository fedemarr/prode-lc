import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateParticipantsExcel } from "@/lib/excel";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const participants = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
  });

  const buffer = await generateParticipantsExcel(participants);

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="participantes-mundial-2026.xlsx"`,
    },
  });
}
