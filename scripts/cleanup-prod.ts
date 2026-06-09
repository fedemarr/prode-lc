import { readFileSync } from "fs";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

// Load .env.local and set DATABASE_URL to DIRECT_URL
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  process.env[key] = val;
}

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Iniciando limpieza...\n");

  const [sp, pred, lb] = await Promise.all([
    prisma.specialPrediction.deleteMany({}),
    prisma.prediction.deleteMany({}),
    prisma.leaderboardEntry.deleteMany({}),
  ]);

  const users = await prisma.user.deleteMany({ where: { role: "USER" } });

  const matches = await prisma.match.updateMany({
    where: {
      OR: [
        { homeScore: { not: null } },
        { awayScore: { not: null } },
        { status: { not: "PENDING" } },
      ],
    },
    data: { homeScore: null, awayScore: null, status: "PENDING" },
  });

  console.log("✅ Limpieza completada:");
  console.log(`   Pronósticos especiales borrados : ${sp.count}`);
  console.log(`   Pronósticos de partidos borrados: ${pred.count}`);
  console.log(`   Entradas de ranking borradas    : ${lb.count}`);
  console.log(`   Usuarios de prueba borrados     : ${users.count}`);
  console.log(`   Partidos reseteados a PENDING   : ${matches.count}`);
  console.log("\n🚀 Base de datos lista para producción.");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
