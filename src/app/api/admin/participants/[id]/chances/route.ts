import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { chances } = await req.json();
  const value = Math.max(1, Math.min(10, Number(chances)));

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { chances: value },
    select: { id: true, chances: true },
  });

  return NextResponse.json(user);
}
