import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/reset — borra todos los usuarios de prueba, pronósticos y leaderboard
// Mantiene: teams, matches, tournament, special questions
export async function POST(req: NextRequest) {
  if (req.headers.get("x-seed-secret") !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Borrar en orden (FK constraints)
  const [sp, pred, lb] = await Promise.all([
    prisma.specialPrediction.deleteMany({}),
    prisma.prediction.deleteMany({}),
    prisma.leaderboardEntry.deleteMany({}),
  ]);

  const deletedUsers = await prisma.user.deleteMany({
    where: { role: "USER" },
  });

  return NextResponse.json({
    ok: true,
    deleted: {
      specialPredictions: sp.count,
      predictions: pred.count,
      leaderboardEntries: lb.count,
      users: deletedUsers.count,
    },
    msg: "Reset completo — partidos, equipos y torneo intactos ✅",
  });
}
