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

  // Solo borra usuarios que NO están pendientes (los de prueba aprobados/rechazados)
  // Los PENDING son gente real que pidió acceso — se conservan
  const deletedUsers = await prisma.user.deleteMany({
    where: { role: "USER", status: { not: "PENDING" } },
  });

  // Resetear partidos con resultado a PENDING sin score
  const resetMatches = await prisma.match.updateMany({
    where: {
      OR: [
        { homeScore: { not: null } },
        { awayScore: { not: null } },
        { status: { not: "PENDING" } },
      ],
    },
    data: { homeScore: null, awayScore: null, status: "PENDING" },
  });

  return NextResponse.json({
    ok: true,
    deleted: {
      specialPredictions: sp.count,
      predictions: pred.count,
      leaderboardEntries: lb.count,
      users: deletedUsers.count,
    },
    resetMatches: resetMatches.count,
    msg: "Reset completo — equipos, torneo y preguntas especiales intactos ✅",
  });
}
