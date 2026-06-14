import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Converts Argentina local time (UTC-3) to UTC Date for DB storage
function ar(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h + 3, min));
}

// All group stage matches with correct Argentina kickoff times
const SCHEDULE = [
  { home: "MEX", away: "RSA", date: "2026-06-11", time: "16:00" },
  { home: "KOR", away: "UDd", date: "2026-06-11", time: "23:00" },
  { home: "UDd", away: "RSA", date: "2026-06-18", time: "13:00" },
  { home: "MEX", away: "KOR", date: "2026-06-18", time: "22:00" },
  { home: "UDd", away: "MEX", date: "2026-06-24", time: "22:00" },
  { home: "RSA", away: "KOR", date: "2026-06-24", time: "22:00" },
  { home: "CAN", away: "UE1", date: "2026-06-12", time: "16:00" },
  { home: "QAT", away: "SUI", date: "2026-06-13", time: "16:00" },
  { home: "SUI", away: "UE1", date: "2026-06-18", time: "16:00" },
  { home: "CAN", away: "QAT", date: "2026-06-18", time: "19:00" },
  { home: "SUI", away: "CAN", date: "2026-06-24", time: "16:00" },
  { home: "UE1", away: "QAT", date: "2026-06-24", time: "16:00" },
  { home: "BRA", away: "MAR", date: "2026-06-13", time: "19:00" },
  { home: "HAI", away: "SCO", date: "2026-06-13", time: "22:00" },
  { home: "SCO", away: "MAR", date: "2026-06-19", time: "19:00" },
  { home: "BRA", away: "HAI", date: "2026-06-19", time: "22:00" },
  { home: "SCO", away: "BRA", date: "2026-06-24", time: "19:00" },
  { home: "MAR", away: "HAI", date: "2026-06-26", time: "19:00" },
  { home: "USA", away: "PAR", date: "2026-06-12", time: "22:00" },
  { home: "AUS", away: "UEC", date: "2026-06-13", time: "01:00" },
  { home: "UEC", away: "PAR", date: "2026-06-19", time: "01:00" },
  { home: "USA", away: "AUS", date: "2026-06-19", time: "16:00" },
  { home: "UEC", away: "USA", date: "2026-06-26", time: "23:00" },
  { home: "PAR", away: "AUS", date: "2026-06-25", time: "23:00" },
  { home: "GER", away: "CUW", date: "2026-06-14", time: "14:00" },
  { home: "CIV", away: "ECU", date: "2026-06-14", time: "20:00" },
  { home: "GER", away: "CIV", date: "2026-06-20", time: "17:00" },
  { home: "CUW", away: "ECU", date: "2026-06-20", time: "21:00" },
  { home: "ECU", away: "GER", date: "2026-06-25", time: "17:00" },
  { home: "CUW", away: "CIV", date: "2026-06-25", time: "17:00" },
  { home: "NED", away: "JPN", date: "2026-06-14", time: "17:00" },
  { home: "UEB", away: "TUN", date: "2026-06-14", time: "23:00" },
  { home: "NED", away: "UEB", date: "2026-06-20", time: "14:00" },
  { home: "TUN", away: "JPN", date: "2026-06-20", time: "01:00" },
  { home: "JPN", away: "UEB", date: "2026-06-25", time: "20:00" },
  { home: "TUN", away: "NED", date: "2026-06-25", time: "20:00" },
  { home: "BEL", away: "EGY", date: "2026-06-15", time: "16:00" },
  { home: "IRI", away: "NZL", date: "2026-06-15", time: "22:00" },
  { home: "BEL", away: "IRI", date: "2026-06-21", time: "16:00" },
  { home: "NZL", away: "EGY", date: "2026-06-21", time: "22:00" },
  { home: "EGY", away: "IRI", date: "2026-06-27", time: "00:00" },
  { home: "NZL", away: "BEL", date: "2026-06-27", time: "00:00" },
  { home: "ESP", away: "CPV", date: "2026-06-15", time: "13:00" },
  { home: "KSA", away: "URU", date: "2026-06-15", time: "19:00" },
  { home: "ESP", away: "KSA", date: "2026-06-21", time: "13:00" },
  { home: "URU", away: "CPV", date: "2026-06-21", time: "19:00" },
  { home: "CPV", away: "KSA", date: "2026-06-26", time: "21:00" },
  { home: "URU", away: "ESP", date: "2026-06-26", time: "21:00" },
  { home: "FRA", away: "SEN", date: "2026-06-16", time: "16:00" },
  { home: "FI2", away: "NOR", date: "2026-06-16", time: "19:00" },
  { home: "FRA", away: "FI2", date: "2026-06-22", time: "18:00" },
  { home: "NOR", away: "SEN", date: "2026-06-22", time: "21:00" },
  { home: "NOR", away: "FRA", date: "2026-06-26", time: "16:00" },
  { home: "SEN", away: "FI2", date: "2026-06-26", time: "16:00" },
  { home: "ARG", away: "ALG", date: "2026-06-16", time: "22:00" },
  { home: "AUT", away: "JOR", date: "2026-06-16", time: "02:00" },
  { home: "ARG", away: "AUT", date: "2026-06-22", time: "14:00" },
  { home: "JOR", away: "ALG", date: "2026-06-23", time: "01:00" },
  { home: "ALG", away: "AUT", date: "2026-06-27", time: "23:00" },
  { home: "JOR", away: "ARG", date: "2026-06-27", time: "23:00" },
  { home: "POR", away: "FI1", date: "2026-06-17", time: "14:00" },
  { home: "UZB", away: "COL", date: "2026-06-17", time: "23:00" },
  { home: "POR", away: "UZB", date: "2026-06-23", time: "14:00" },
  { home: "FI1", away: "COL", date: "2026-06-23", time: "23:00" },
  { home: "COL", away: "POR", date: "2026-06-27", time: "20:30" },
  { home: "FI1", away: "UZB", date: "2026-06-27", time: "20:30" },
  { home: "ENG", away: "CRO", date: "2026-06-17", time: "17:00" },
  { home: "GHA", away: "PAN", date: "2026-06-17", time: "20:00" },
  { home: "ENG", away: "GHA", date: "2026-06-23", time: "17:00" },
  { home: "PAN", away: "CRO", date: "2026-06-23", time: "20:00" },
  { home: "PAN", away: "ENG", date: "2026-06-27", time: "18:00" },
  { home: "CRO", away: "GHA", date: "2026-06-27", time: "18:00" },
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allTeams = await prisma.team.findMany({ select: { id: true, abbreviation: true } });
    const tm: Record<string, string> = {};
    allTeams.forEach((t) => { tm[t.abbreviation] = t.id; });

    let updated = 0;
    let notFound = 0;

    for (const m of SCHEDULE) {
      const homeTeamId = tm[m.home];
      const awayTeamId = tm[m.away];
      if (!homeTeamId || !awayTeamId) { notFound++; continue; }

      const result = await prisma.match.updateMany({
        where: { tournamentId: "mundial-2026", homeTeamId, awayTeamId },
        data: { scheduledAt: ar(m.date, m.time) },
      });

      updated += result.count;
    }

    return NextResponse.json({ ok: true, updated, notFound });
  } catch (e: any) {
    console.error("fix-match-times error:", e);
    return NextResponse.json({ error: e?.message ?? "Error interno" }, { status: 500 });
  }
}
