import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Protected seed endpoint — only callable with SEED_SECRET header
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const results: string[] = [];

    // Admin
    const adminHash = await bcrypt.hash("admin123", 12);
    await prisma.user.upsert({
      where: { email: "admin@loscedros.com" },
      update: {},
      create: {
        firstName: "Admin", lastName: "Los Cedros",
        email: "admin@loscedros.com", phone: "1100000000",
        passwordHash: adminHash, role: "ADMIN", status: "APPROVED",
      },
    });
    results.push("✅ Admin creado");

    // Example users
    const pass = await bcrypt.hash("password123", 12);
    const usersData = [
      { firstName: "Juan", lastName: "Pérez", email: "juan@example.com", phone: "1123456789", status: "APPROVED" as const },
      { firstName: "María", lastName: "García", email: "maria@example.com", phone: "1134567890", status: "APPROVED" as const },
      { firstName: "Carlos", lastName: "López", email: "carlos@example.com", phone: "1145678901", status: "APPROVED" as const },
      { firstName: "Ana", lastName: "Martínez", email: "ana@example.com", phone: "1156789012", status: "PENDING" as const },
      { firstName: "Lucas", lastName: "Rodriguez", email: "lucas@example.com", phone: "1167890123", status: "PENDING" as const },
      { firstName: "Sofía", lastName: "Fernández", email: "sofia@example.com", phone: "1178901234", status: "REJECTED" as const },
    ];
    for (const u of usersData) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash: pass },
      });
    }
    results.push("✅ 6 usuarios de ejemplo creados");

    // Tournament
    const tournament = await prisma.tournament.upsert({
      where: { id: "mundial-2026" },
      update: {},
      create: {
        id: "mundial-2026",
        name: "Mundial 2026 — Club Los Cedros",
        organization: "FIFA", season: "2026",
        status: "ACTIVE",
        startsAt: new Date("2026-06-11T19:00:00.000Z"),
        endsAt: new Date("2026-07-19T23:59:00.000Z"),
        scoringConfig: { exact: 5, winner: 2 },
      },
    });
    results.push("✅ Torneo creado");

    // Teams
    const teamsData = [
      { group: "A", name: "México", abbreviation: "MEX", flag: "🇲🇽" },
      { group: "A", name: "Sudáfrica", abbreviation: "RSA", flag: "🇿🇦" },
      { group: "A", name: "Corea del Sur", abbreviation: "KOR", flag: "🇰🇷" },
      { group: "A", name: "UEFA-D", abbreviation: "UDd", flag: "🏳️" },
      { group: "B", name: "Canadá", abbreviation: "CAN", flag: "🇨🇦" },
      { group: "B", name: "UEFA-1", abbreviation: "UE1", flag: "🏳️" },
      { group: "B", name: "Qatar", abbreviation: "QAT", flag: "🇶🇦" },
      { group: "B", name: "Suiza", abbreviation: "SUI", flag: "🇨🇭" },
      { group: "C", name: "Brasil", abbreviation: "BRA", flag: "🇧🇷" },
      { group: "C", name: "Marruecos", abbreviation: "MAR", flag: "🇲🇦" },
      { group: "C", name: "Haití", abbreviation: "HAI", flag: "🇭🇹" },
      { group: "C", name: "Escocia", abbreviation: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
      { group: "D", name: "Estados Unidos", abbreviation: "USA", flag: "🇺🇸" },
      { group: "D", name: "Paraguay", abbreviation: "PAR", flag: "🇵🇾" },
      { group: "D", name: "Australia", abbreviation: "AUS", flag: "🇦🇺" },
      { group: "D", name: "UEFA-C", abbreviation: "UEC", flag: "🏳️" },
      { group: "E", name: "Alemania", abbreviation: "GER", flag: "🇩🇪" },
      { group: "E", name: "Curazao", abbreviation: "CUW", flag: "🇨🇼" },
      { group: "E", name: "Costa de Marfil", abbreviation: "CIV", flag: "🇨🇮" },
      { group: "E", name: "Ecuador", abbreviation: "ECU", flag: "🇪🇨" },
      { group: "F", name: "Países Bajos", abbreviation: "NED", flag: "🇳🇱" },
      { group: "F", name: "Japón", abbreviation: "JPN", flag: "🇯🇵" },
      { group: "F", name: "UEFA-B", abbreviation: "UEB", flag: "🏳️" },
      { group: "F", name: "Túnez", abbreviation: "TUN", flag: "🇹🇳" },
      { group: "G", name: "Bélgica", abbreviation: "BEL", flag: "🇧🇪" },
      { group: "G", name: "Egipto", abbreviation: "EGY", flag: "🇪🇬" },
      { group: "G", name: "Irán", abbreviation: "IRI", flag: "🇮🇷" },
      { group: "G", name: "Nueva Zelanda", abbreviation: "NZL", flag: "🇳🇿" },
      { group: "H", name: "España", abbreviation: "ESP", flag: "🇪🇸" },
      { group: "H", name: "Cabo Verde", abbreviation: "CPV", flag: "🇨🇻" },
      { group: "H", name: "Arabia Saudita", abbreviation: "KSA", flag: "🇸🇦" },
      { group: "H", name: "Uruguay", abbreviation: "URU", flag: "🇺🇾" },
      { group: "I", name: "Francia", abbreviation: "FRA", flag: "🇫🇷" },
      { group: "I", name: "Senegal", abbreviation: "SEN", flag: "🇸🇳" },
      { group: "I", name: "FIFA-2", abbreviation: "FI2", flag: "🏳️" },
      { group: "I", name: "Noruega", abbreviation: "NOR", flag: "🇳🇴" },
      { group: "J", name: "Argentina", abbreviation: "ARG", flag: "🇦🇷" },
      { group: "J", name: "Argelia", abbreviation: "ALG", flag: "🇩🇿" },
      { group: "J", name: "Austria", abbreviation: "AUT", flag: "🇦🇹" },
      { group: "J", name: "Jordania", abbreviation: "JOR", flag: "🇯🇴" },
      { group: "K", name: "Portugal", abbreviation: "POR", flag: "🇵🇹" },
      { group: "K", name: "FIFA-1", abbreviation: "FI1", flag: "🏳️" },
      { group: "K", name: "Uzbekistán", abbreviation: "UZB", flag: "🇺🇿" },
      { group: "K", name: "Colombia", abbreviation: "COL", flag: "🇨🇴" },
      { group: "L", name: "Inglaterra", abbreviation: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { group: "L", name: "Croacia", abbreviation: "CRO", flag: "🇭🇷" },
      { group: "L", name: "Ghana", abbreviation: "GHA", flag: "🇬🇭" },
      { group: "L", name: "Panamá", abbreviation: "PAN", flag: "🇵🇦" },
    ];

    const teamMap: Record<string, string> = {};
    for (const t of teamsData) {
      const existing = await prisma.team.findFirst({ where: { abbreviation: t.abbreviation } });
      const team = existing
        ? await prisma.team.update({ where: { id: existing.id }, data: t })
        : await prisma.team.create({ data: t });
      teamMap[t.abbreviation] = team.id;
    }
    results.push(`✅ ${teamsData.length} equipos creados`);

    // Helper: AR time to UTC
    const ar = (d: string, t: string) => {
      const [y, m, day] = d.split("-").map(Number);
      const [h, min] = t.split(":").map(Number);
      return new Date(Date.UTC(y, m - 1, day, h + 3, min));
    };

    // Group matches
    const groupMatches = [
      { home: "MEX", away: "RSA", date: "2026-06-11", time: "16:00", group: "A", round: "Grupo A - Fecha 1", venue: "Estadio Azteca, Ciudad de México" },
      { home: "KOR", away: "UDd", date: "2026-06-11", time: "23:00", group: "A", round: "Grupo A - Fecha 1", venue: "Estadio Akron, Guadalajara" },
      { home: "UDd", away: "RSA", date: "2026-06-18", time: "13:00", group: "A", round: "Grupo A - Fecha 2", venue: "Mercedes Benz Stadium, Atlanta" },
      { home: "MEX", away: "KOR", date: "2026-06-18", time: "22:00", group: "A", round: "Grupo A - Fecha 2", venue: "Estadio Akron, Guadalajara" },
      { home: "UDd", away: "MEX", date: "2026-06-24", time: "22:00", group: "A", round: "Grupo A - Fecha 3", venue: "Estadio Azteca, Ciudad de México" },
      { home: "RSA", away: "KOR", date: "2026-06-24", time: "22:00", group: "A", round: "Grupo A - Fecha 3", venue: "Estadio BBVA, Monterrey" },
      { home: "CAN", away: "UE1", date: "2026-06-12", time: "16:00", group: "B", round: "Grupo B - Fecha 1", venue: "BMO Field, Toronto" },
      { home: "QAT", away: "SUI", date: "2026-06-13", time: "16:00", group: "B", round: "Grupo B - Fecha 1", venue: "Levi's Stadium, San Francisco" },
      { home: "SUI", away: "UE1", date: "2026-06-18", time: "16:00", group: "B", round: "Grupo B - Fecha 2", venue: "SoFi Stadium, Los Angeles" },
      { home: "CAN", away: "QAT", date: "2026-06-18", time: "19:00", group: "B", round: "Grupo B - Fecha 2", venue: "BC Place, Vancouver" },
      { home: "SUI", away: "CAN", date: "2026-06-24", time: "16:00", group: "B", round: "Grupo B - Fecha 3", venue: "BC Place, Vancouver" },
      { home: "UE1", away: "QAT", date: "2026-06-24", time: "16:00", group: "B", round: "Grupo B - Fecha 3", venue: "Lumen Field, Seattle" },
      { home: "BRA", away: "MAR", date: "2026-06-13", time: "19:00", group: "C", round: "Grupo C - Fecha 1", venue: "MetLife Stadium, Nueva Jersey" },
      { home: "HAI", away: "SCO", date: "2026-06-13", time: "22:00", group: "C", round: "Grupo C - Fecha 1", venue: "Gillette Stadium, Boston" },
      { home: "SCO", away: "MAR", date: "2026-06-19", time: "19:00", group: "C", round: "Grupo C - Fecha 2", venue: "Gillette Stadium, Boston" },
      { home: "BRA", away: "HAI", date: "2026-06-19", time: "22:00", group: "C", round: "Grupo C - Fecha 2", venue: "Estadio de Philadelphia" },
      { home: "SCO", away: "BRA", date: "2026-06-24", time: "19:00", group: "C", round: "Grupo C - Fecha 3", venue: "Hard Rock Stadium, Miami" },
      { home: "MAR", away: "HAI", date: "2026-06-26", time: "19:00", group: "C", round: "Grupo C - Fecha 3", venue: "Mercedes Benz Stadium, Atlanta" },
      { home: "USA", away: "PAR", date: "2026-06-12", time: "22:00", group: "D", round: "Grupo D - Fecha 1", venue: "SoFi Stadium, Los Angeles" },
      { home: "AUS", away: "UEC", date: "2026-06-13", time: "01:00", group: "D", round: "Grupo D - Fecha 1", venue: "BC Place, Vancouver" },
      { home: "UEC", away: "PAR", date: "2026-06-19", time: "01:00", group: "D", round: "Grupo D - Fecha 2", venue: "Levi's Stadium, San Francisco" },
      { home: "USA", away: "AUS", date: "2026-06-19", time: "16:00", group: "D", round: "Grupo D - Fecha 2", venue: "Lumen Field, Seattle" },
      { home: "UEC", away: "USA", date: "2026-06-26", time: "23:00", group: "D", round: "Grupo D - Fecha 3", venue: "SoFi Stadium, Los Angeles" },
      { home: "PAR", away: "AUS", date: "2026-06-25", time: "23:00", group: "D", round: "Grupo D - Fecha 3", venue: "Levi's Stadium, San Francisco" },
      { home: "GER", away: "CUW", date: "2026-06-14", time: "14:00", group: "E", round: "Grupo E - Fecha 1", venue: "NRG Stadium, Houston" },
      { home: "CIV", away: "ECU", date: "2026-06-14", time: "20:00", group: "E", round: "Grupo E - Fecha 1", venue: "Estadio de Philadelphia" },
      { home: "GER", away: "CIV", date: "2026-06-20", time: "17:00", group: "E", round: "Grupo E - Fecha 2", venue: "BMO Field, Toronto" },
      { home: "CUW", away: "ECU", date: "2026-06-20", time: "21:00", group: "E", round: "Grupo E - Fecha 2", venue: "Arrowhead Stadium, Kansas" },
      { home: "ECU", away: "GER", date: "2026-06-25", time: "17:00", group: "E", round: "Grupo E - Fecha 3", venue: "MetLife Stadium, Nueva Jersey" },
      { home: "CUW", away: "CIV", date: "2026-06-25", time: "17:00", group: "E", round: "Grupo E - Fecha 3", venue: "Estadio de Philadelphia" },
      { home: "NED", away: "JPN", date: "2026-06-14", time: "17:00", group: "F", round: "Grupo F - Fecha 1", venue: "AT&T Stadium, Dallas" },
      { home: "UEB", away: "TUN", date: "2026-06-14", time: "23:00", group: "F", round: "Grupo F - Fecha 1", venue: "Estadio BBVA, Monterrey" },
      { home: "NED", away: "UEB", date: "2026-06-20", time: "14:00", group: "F", round: "Grupo F - Fecha 2", venue: "NRG Stadium, Houston" },
      { home: "TUN", away: "JPN", date: "2026-06-20", time: "01:00", group: "F", round: "Grupo F - Fecha 2", venue: "Estadio BBVA, Monterrey" },
      { home: "JPN", away: "UEB", date: "2026-06-25", time: "20:00", group: "F", round: "Grupo F - Fecha 3", venue: "AT&T Stadium, Dallas" },
      { home: "TUN", away: "NED", date: "2026-06-25", time: "20:00", group: "F", round: "Grupo F - Fecha 3", venue: "Arrowhead Stadium, Kansas" },
      { home: "BEL", away: "EGY", date: "2026-06-15", time: "16:00", group: "G", round: "Grupo G - Fecha 1", venue: "Lumen Field, Seattle" },
      { home: "IRI", away: "NZL", date: "2026-06-15", time: "22:00", group: "G", round: "Grupo G - Fecha 1", venue: "SoFi Stadium, Los Angeles" },
      { home: "BEL", away: "IRI", date: "2026-06-21", time: "16:00", group: "G", round: "Grupo G - Fecha 2", venue: "SoFi Stadium, Los Angeles" },
      { home: "NZL", away: "EGY", date: "2026-06-21", time: "22:00", group: "G", round: "Grupo G - Fecha 2", venue: "BC Place, Vancouver" },
      { home: "EGY", away: "IRI", date: "2026-06-27", time: "00:00", group: "G", round: "Grupo G - Fecha 3", venue: "Lumen Field, Seattle" },
      { home: "NZL", away: "BEL", date: "2026-06-27", time: "00:00", group: "G", round: "Grupo G - Fecha 3", venue: "BC Place, Vancouver" },
      { home: "ESP", away: "CPV", date: "2026-06-15", time: "13:00", group: "H", round: "Grupo H - Fecha 1", venue: "Mercedes Benz Stadium, Atlanta" },
      { home: "KSA", away: "URU", date: "2026-06-15", time: "19:00", group: "H", round: "Grupo H - Fecha 1", venue: "Hard Rock Stadium, Miami" },
      { home: "ESP", away: "KSA", date: "2026-06-21", time: "13:00", group: "H", round: "Grupo H - Fecha 2", venue: "Mercedes Benz Stadium, Atlanta" },
      { home: "URU", away: "CPV", date: "2026-06-21", time: "19:00", group: "H", round: "Grupo H - Fecha 2", venue: "Hard Rock Stadium, Miami" },
      { home: "CPV", away: "KSA", date: "2026-06-26", time: "21:00", group: "H", round: "Grupo H - Fecha 3", venue: "NRG Stadium, Houston" },
      { home: "URU", away: "ESP", date: "2026-06-26", time: "21:00", group: "H", round: "Grupo H - Fecha 3", venue: "Estadio Akron, Guadalajara" },
      { home: "FRA", away: "SEN", date: "2026-06-16", time: "16:00", group: "I", round: "Grupo I - Fecha 1", venue: "MetLife Stadium, Nueva Jersey" },
      { home: "FI2", away: "NOR", date: "2026-06-16", time: "19:00", group: "I", round: "Grupo I - Fecha 1", venue: "Gillette Stadium, Boston" },
      { home: "FRA", away: "FI2", date: "2026-06-22", time: "18:00", group: "I", round: "Grupo I - Fecha 2", venue: "Estadio de Philadelphia" },
      { home: "NOR", away: "SEN", date: "2026-06-22", time: "21:00", group: "I", round: "Grupo I - Fecha 2", venue: "MetLife Stadium, Nueva Jersey" },
      { home: "NOR", away: "FRA", date: "2026-06-26", time: "16:00", group: "I", round: "Grupo I - Fecha 3", venue: "Gillette Stadium, Boston" },
      { home: "SEN", away: "FI2", date: "2026-06-26", time: "16:00", group: "I", round: "Grupo I - Fecha 3", venue: "BMO Field, Toronto" },
      { home: "ARG", away: "ALG", date: "2026-06-16", time: "22:00", group: "J", round: "Grupo J - Fecha 1", venue: "Arrowhead Stadium, Kansas" },
      { home: "AUT", away: "JOR", date: "2026-06-16", time: "02:00", group: "J", round: "Grupo J - Fecha 1", venue: "Levi's Stadium, San Francisco" },
      { home: "ARG", away: "AUT", date: "2026-06-22", time: "14:00", group: "J", round: "Grupo J - Fecha 2", venue: "AT&T Stadium, Dallas" },
      { home: "JOR", away: "ALG", date: "2026-06-23", time: "01:00", group: "J", round: "Grupo J - Fecha 2", venue: "Levi's Stadium, San Francisco" },
      { home: "ALG", away: "AUT", date: "2026-06-27", time: "23:00", group: "J", round: "Grupo J - Fecha 3", venue: "Arrowhead Stadium, Kansas" },
      { home: "JOR", away: "ARG", date: "2026-06-27", time: "23:00", group: "J", round: "Grupo J - Fecha 3", venue: "AT&T Stadium, Dallas" },
      { home: "POR", away: "FI1", date: "2026-06-17", time: "14:00", group: "K", round: "Grupo K - Fecha 1", venue: "NRG Stadium, Houston" },
      { home: "UZB", away: "COL", date: "2026-06-17", time: "23:00", group: "K", round: "Grupo K - Fecha 1", venue: "Estadio Azteca, Ciudad de México" },
      { home: "POR", away: "UZB", date: "2026-06-23", time: "14:00", group: "K", round: "Grupo K - Fecha 2", venue: "NRG Stadium, Houston" },
      { home: "FI1", away: "COL", date: "2026-06-23", time: "23:00", group: "K", round: "Grupo K - Fecha 2", venue: "Estadio Akron, Guadalajara" },
      { home: "COL", away: "POR", date: "2026-06-27", time: "20:30", group: "K", round: "Grupo K - Fecha 3", venue: "Hard Rock Stadium, Miami" },
      { home: "FI1", away: "UZB", date: "2026-06-27", time: "20:30", group: "K", round: "Grupo K - Fecha 3", venue: "Mercedes Benz Stadium, Atlanta" },
      { home: "ENG", away: "CRO", date: "2026-06-17", time: "17:00", group: "L", round: "Grupo L - Fecha 1", venue: "AT&T Stadium, Dallas" },
      { home: "GHA", away: "PAN", date: "2026-06-17", time: "20:00", group: "L", round: "Grupo L - Fecha 1", venue: "BMO Field, Toronto" },
      { home: "ENG", away: "GHA", date: "2026-06-23", time: "17:00", group: "L", round: "Grupo L - Fecha 2", venue: "Gillette Stadium, Boston" },
      { home: "PAN", away: "CRO", date: "2026-06-23", time: "20:00", group: "L", round: "Grupo L - Fecha 2", venue: "BMO Field, Toronto" },
      { home: "PAN", away: "ENG", date: "2026-06-27", time: "18:00", group: "L", round: "Grupo L - Fecha 3", venue: "MetLife Stadium, Nueva Jersey" },
      { home: "CRO", away: "GHA", date: "2026-06-27", time: "18:00", group: "L", round: "Grupo L - Fecha 3", venue: "Estadio de Philadelphia" },
    ];

    let mc = 0;
    for (const m of groupMatches) {
      const exists = await prisma.match.findFirst({
        where: { tournamentId: tournament.id, homeTeamId: teamMap[m.home], awayTeamId: teamMap[m.away], phase: "GROUP" },
      });
      if (!exists) {
        await prisma.match.create({
          data: {
            tournamentId: tournament.id,
            homeTeamId: teamMap[m.home], awayTeamId: teamMap[m.away],
            phase: "GROUP", groupName: m.group, roundLabel: m.round,
            venue: m.venue, scheduledAt: ar(m.date, m.time), status: "PENDING",
          },
        });
        mc++;
      }
    }
    results.push(`✅ ${mc} partidos de grupos creados`);

    // Knockout placeholders
    const mexId = teamMap["MEX"];
    const usaId = teamMap["USA"];
    const ko = [
      ...Array.from({ length: 16 }, (_, i) => ({ phase: "R32" as const, round: `Ronda de 32 - Partido ${i + 1}`, date: "2026-06-29", time: "20:00" })),
      ...Array.from({ length: 8 }, (_, i) => ({ phase: "R16" as const, round: `Ronda de 16 - Partido ${i + 1}`, date: "2026-07-05", time: "20:00" })),
      ...Array.from({ length: 4 }, (_, i) => ({ phase: "QF" as const, round: `Cuartos de Final - Partido ${i + 1}`, date: "2026-07-11", time: "20:00" })),
      { phase: "SF" as const, round: "Semifinal 1", date: "2026-07-15", time: "20:00" },
      { phase: "SF" as const, round: "Semifinal 2", date: "2026-07-16", time: "20:00" },
      { phase: "FINAL" as const, round: "Final", date: "2026-07-19", time: "16:00" },
    ];
    let kc = 0;
    for (const m of ko) {
      const exists = await prisma.match.findFirst({ where: { tournamentId: tournament.id, roundLabel: m.round } });
      if (!exists) {
        await prisma.match.create({
          data: {
            tournamentId: tournament.id, homeTeamId: mexId, awayTeamId: usaId,
            phase: m.phase, groupName: null, roundLabel: m.round,
            venue: "Por definir", scheduledAt: ar(m.date, m.time), status: "PENDING",
          },
        });
        kc++;
      }
    }
    results.push(`✅ ${kc} partidos knockout creados`);

    // Special questions
    const questions = [
      { question: "¿Quién será Campeón del Mundial?", points: 15, orderIndex: 1 },
      { question: "¿Quién será Subcampeón del Mundial?", points: 10, orderIndex: 2 },
      { question: "¿Quién quedará en Tercer Puesto?", points: 8, orderIndex: 3 },
      { question: "¿Quién será el Goleador del torneo?", points: 10, orderIndex: 4 },
      { question: "¿Quién será el Mejor Arquero del torneo?", points: 8, orderIndex: 5 },
      { question: "¿Qué selección hará más goles en la fase de grupos?", points: 8, orderIndex: 6 },
      { question: "¿Qué selección recibirá más goles en la fase de grupos?", points: 6, orderIndex: 7 },
      { question: "¿Llega Argentina a Semifinales?", points: 5, orderIndex: 8 },
      { question: "¿Llega Argentina a la Final?", points: 8, orderIndex: 9 },
      { question: "¿Argentina Campeón?", points: 15, orderIndex: 10 },
    ];
    let qc = 0;
    for (const q of questions) {
      const exists = await prisma.specialQuestion.findFirst({ where: { tournamentId: tournament.id, question: q.question } });
      if (!exists) {
        await prisma.specialQuestion.create({ data: { ...q, tournamentId: tournament.id } });
        qc++;
      }
    }
    results.push(`✅ ${qc} preguntas especiales creadas`);

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
