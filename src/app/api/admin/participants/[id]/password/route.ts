import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { password } = await req.json();
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: params.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
