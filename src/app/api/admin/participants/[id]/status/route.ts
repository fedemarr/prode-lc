import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { status },
    select: { id: true, firstName: true, email: true, status: true },
  });

  if (status === "APPROVED") {
    await sendApprovalEmail(user.email, user.firstName).catch(console.error);
    // Create leaderboard entry
    const tournament = await prisma.tournament.findFirst({ where: { status: "ACTIVE" } });
    if (tournament) {
      await prisma.leaderboardEntry.upsert({
        where: { userId_tournamentId_phase: { userId: user.id, tournamentId: tournament.id, phase: "total" } },
        update: {},
        create: { userId: user.id, tournamentId: tournament.id, phase: "total", points: 0 },
      });
    }
  } else {
    await sendRejectionEmail(user.email, user.firstName).catch(console.error);
  }

  return NextResponse.json(user);
}
