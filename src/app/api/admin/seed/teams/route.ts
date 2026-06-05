import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (req.headers.get("x-seed-secret") !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates = [
    { abbreviation: "UDd", name: "República Checa", newAbbr: "CZE", flag: "🇨🇿" },
    { abbreviation: "UE1", name: "Bosnia y Herzegovina", newAbbr: "BIH", flag: "🇧🇦" },
    { abbreviation: "UEC", name: "Turquía", newAbbr: "TUR", flag: "🇹🇷" },
    { abbreviation: "UEB", name: "Suecia", newAbbr: "SWE", flag: "🇸🇪" },
    { abbreviation: "FI2", name: "Irak", newAbbr: "IRQ", flag: "🇮🇶" },
    { abbreviation: "FI1", name: "Rep. D. del Congo", newAbbr: "COD", flag: "🇨🇩" },
  ];

  const results = [];
  for (const u of updates) {
    const team = await prisma.team.findFirst({ where: { abbreviation: u.abbreviation } });
    if (team) {
      await prisma.team.update({
        where: { id: team.id },
        data: { name: u.name, abbreviation: u.newAbbr, flag: u.flag },
      });
      results.push(`✅ ${u.abbreviation} → ${u.name} (${u.newAbbr})`);
    } else {
      results.push(`⚠️ No encontrado: ${u.abbreviation}`);
    }
  }

  return NextResponse.json({ ok: true, results });
}
