import { PrismaClient, MatchPhase, MatchStatus, Role, UserStatus, TournamentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@loscedros.com" },
    update: {},
    create: {
      firstName: "Admin",
      lastName: "Los Cedros",
      email: "admin@loscedros.com",
      phone: "1100000000",
      passwordHash: adminHash,
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
    },
  });

  // 6 example users
  const pass = await bcrypt.hash("password123", 12);
  const users = await Promise.all([
    prisma.user.upsert({ where: { email: "juan@example.com" }, update: {}, create: { firstName: "Juan", lastName: "Pérez", email: "juan@example.com", phone: "1123456789", passwordHash: pass, status: UserStatus.APPROVED } }),
    prisma.user.upsert({ where: { email: "maria@example.com" }, update: {}, create: { firstName: "María", lastName: "García", email: "maria@example.com", phone: "1134567890", passwordHash: pass, status: UserStatus.APPROVED } }),
    prisma.user.upsert({ where: { email: "carlos@example.com" }, update: {}, create: { firstName: "Carlos", lastName: "López", email: "carlos@example.com", phone: "1145678901", passwordHash: pass, status: UserStatus.APPROVED } }),
    prisma.user.upsert({ where: { email: "ana@example.com" }, update: {}, create: { firstName: "Ana", lastName: "Martínez", email: "ana@example.com", phone: "1156789012", passwordHash: pass, status: UserStatus.PENDING } }),
    prisma.user.upsert({ where: { email: "lucas@example.com" }, update: {}, create: { firstName: "Lucas", lastName: "Rodriguez", email: "lucas@example.com", phone: "1167890123", passwordHash: pass, status: UserStatus.PENDING } }),
    prisma.user.upsert({ where: { email: "sofia@example.com" }, update: {}, create: { firstName: "Sofía", lastName: "Fernández", email: "sofia@example.com", phone: "1178901234", passwordHash: pass, status: UserStatus.REJECTED } }),
  ]);

  // 2. Tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: "mundial-2026" },
    update: {},
    create: {
      id: "mundial-2026",
      name: "Mundial 2026 — Club Los Cedros",
      organization: "FIFA",
      season: "2026",
      status: TournamentStatus.ACTIVE,
      startsAt: new Date("2026-06-11T19:00:00.000Z"),
      endsAt: new Date("2026-07-19T23:59:00.000Z"),
      scoringConfig: { exact: 5, winner: 2 },
    },
  });

  // 3. Teams (48 selecciones)
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
  console.log(`✅ ${teamsData.length} teams seeded`);

  // Helper: Argentina time (GMT-3) to UTC
  const ar = (dateStr: string, timeStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [h, min] = timeStr.split(":").map(Number);
    return new Date(Date.UTC(y, m - 1, d, h + 3, min));
  };

  // 4. Group matches (72 matches)
  const groupMatches = [
    // GRUPO A
    { home: "MEX", away: "RSA", date: "2026-06-11", time: "16:00", group: "A", round: "Grupo A - Fecha 1", venue: "Estadio Azteca, Ciudad de México" },
    { home: "KOR", away: "UDd", date: "2026-06-11", time: "23:00", group: "A", round: "Grupo A - Fecha 1", venue: "Estadio Akron, Guadalajara" },
    { home: "UDd", away: "RSA", date: "2026-06-18", time: "13:00", group: "A", round: "Grupo A - Fecha 2", venue: "Mercedes Benz Stadium, Atlanta" },
    { home: "MEX", away: "KOR", date: "2026-06-18", time: "22:00", group: "A", round: "Grupo A - Fecha 2", venue: "Estadio Akron, Guadalajara" },
    { home: "UDd", away: "MEX", date: "2026-06-24", time: "22:00", group: "A", round: "Grupo A - Fecha 3", venue: "Estadio Azteca, Ciudad de México" },
    { home: "RSA", away: "KOR", date: "2026-06-24", time: "22:00", group: "A", round: "Grupo A - Fecha 3", venue: "Estadio BBVA, Monterrey" },
    // GRUPO B
    { home: "CAN", away: "UE1", date: "2026-06-12", time: "16:00", group: "B", round: "Grupo B - Fecha 1", venue: "BMO Field, Toronto" },
    { home: "QAT", away: "SUI", date: "2026-06-13", time: "16:00", group: "B", round: "Grupo B - Fecha 1", venue: "Levi's Stadium, San Francisco" },
    { home: "SUI", away: "UE1", date: "2026-06-18", time: "16:00", group: "B", round: "Grupo B - Fecha 2", venue: "SoFi Stadium, Los Angeles" },
    { home: "CAN", away: "QAT", date: "2026-06-18", time: "19:00", group: "B", round: "Grupo B - Fecha 2", venue: "BC Place, Vancouver" },
    { home: "SUI", away: "CAN", date: "2026-06-24", time: "16:00", group: "B", round: "Grupo B - Fecha 3", venue: "BC Place, Vancouver" },
    { home: "UE1", away: "QAT", date: "2026-06-24", time: "16:00", group: "B", round: "Grupo B - Fecha 3", venue: "Lumen Field, Seattle" },
    // GRUPO C
    { home: "BRA", away: "MAR", date: "2026-06-13", time: "19:00", group: "C", round: "Grupo C - Fecha 1", venue: "MetLife Stadium, Nueva Jersey" },
    { home: "HAI", away: "SCO", date: "2026-06-13", time: "22:00", group: "C", round: "Grupo C - Fecha 1", venue: "Gillette Stadium, Boston" },
    { home: "SCO", away: "MAR", date: "2026-06-19", time: "19:00", group: "C", round: "Grupo C - Fecha 2", venue: "Gillette Stadium, Boston" },
    { home: "BRA", away: "HAI", date: "2026-06-19", time: "22:00", group: "C", round: "Grupo C - Fecha 2", venue: "Estadio de Philadelphia" },
    { home: "SCO", away: "BRA", date: "2026-06-24", time: "19:00", group: "C", round: "Grupo C - Fecha 3", venue: "Hard Rock Stadium, Miami" },
    { home: "MAR", away: "HAI", date: "2026-06-26", time: "19:00", group: "C", round: "Grupo C - Fecha 3", venue: "Mercedes Benz Stadium, Atlanta" },
    // GRUPO D
    { home: "USA", away: "PAR", date: "2026-06-12", time: "22:00", group: "D", round: "Grupo D - Fecha 1", venue: "SoFi Stadium, Los Angeles" },
    { home: "AUS", away: "UEC", date: "2026-06-13", time: "01:00", group: "D", round: "Grupo D - Fecha 1", venue: "BC Place, Vancouver" },
    { home: "UEC", away: "PAR", date: "2026-06-19", time: "01:00", group: "D", round: "Grupo D - Fecha 2", venue: "Levi's Stadium, San Francisco" },
    { home: "USA", away: "AUS", date: "2026-06-19", time: "16:00", group: "D", round: "Grupo D - Fecha 2", venue: "Lumen Field, Seattle" },
    { home: "UEC", away: "USA", date: "2026-06-26", time: "23:00", group: "D", round: "Grupo D - Fecha 3", venue: "SoFi Stadium, Los Angeles" },
    { home: "PAR", away: "AUS", date: "2026-06-25", time: "23:00", group: "D", round: "Grupo D - Fecha 3", venue: "Levi's Stadium, San Francisco" },
    // GRUPO E
    { home: "GER", away: "CUW", date: "2026-06-14", time: "14:00", group: "E", round: "Grupo E - Fecha 1", venue: "NRG Stadium, Houston" },
    { home: "CIV", away: "ECU", date: "2026-06-14", time: "20:00", group: "E", round: "Grupo E - Fecha 1", venue: "Estadio de Philadelphia" },
    { home: "GER", away: "CIV", date: "2026-06-20", time: "17:00", group: "E", round: "Grupo E - Fecha 2", venue: "BMO Field, Toronto" },
    { home: "CUW", away: "ECU", date: "2026-06-20", time: "21:00", group: "E", round: "Grupo E - Fecha 2", venue: "Arrowhead Stadium, Kansas" },
    { home: "ECU", away: "GER", date: "2026-06-25", time: "17:00", group: "E", round: "Grupo E - Fecha 3", venue: "MetLife Stadium, Nueva Jersey" },
    { home: "CUW", away: "CIV", date: "2026-06-25", time: "17:00", group: "E", round: "Grupo E - Fecha 3", venue: "Estadio de Philadelphia" },
    // GRUPO F
    { home: "NED", away: "JPN", date: "2026-06-14", time: "17:00", group: "F", round: "Grupo F - Fecha 1", venue: "AT&T Stadium, Dallas" },
    { home: "UEB", away: "TUN", date: "2026-06-14", time: "23:00", group: "F", round: "Grupo F - Fecha 1", venue: "Estadio BBVA, Monterrey" },
    { home: "NED", away: "UEB", date: "2026-06-20", time: "14:00", group: "F", round: "Grupo F - Fecha 2", venue: "NRG Stadium, Houston" },
    { home: "TUN", away: "JPN", date: "2026-06-20", time: "01:00", group: "F", round: "Grupo F - Fecha 2", venue: "Estadio BBVA, Monterrey" },
    { home: "JPN", away: "UEB", date: "2026-06-25", time: "20:00", group: "F", round: "Grupo F - Fecha 3", venue: "AT&T Stadium, Dallas" },
    { home: "TUN", away: "NED", date: "2026-06-25", time: "20:00", group: "F", round: "Grupo F - Fecha 3", venue: "Arrowhead Stadium, Kansas" },
    // GRUPO G
    { home: "BEL", away: "EGY", date: "2026-06-15", time: "16:00", group: "G", round: "Grupo G - Fecha 1", venue: "Lumen Field, Seattle" },
    { home: "IRI", away: "NZL", date: "2026-06-15", time: "22:00", group: "G", round: "Grupo G - Fecha 1", venue: "SoFi Stadium, Los Angeles" },
    { home: "BEL", away: "IRI", date: "2026-06-21", time: "16:00", group: "G", round: "Grupo G - Fecha 2", venue: "SoFi Stadium, Los Angeles" },
    { home: "NZL", away: "EGY", date: "2026-06-21", time: "22:00", group: "G", round: "Grupo G - Fecha 2", venue: "BC Place, Vancouver" },
    { home: "EGY", away: "IRI", date: "2026-06-27", time: "00:00", group: "G", round: "Grupo G - Fecha 3", venue: "Lumen Field, Seattle" },
    { home: "NZL", away: "BEL", date: "2026-06-27", time: "00:00", group: "G", round: "Grupo G - Fecha 3", venue: "BC Place, Vancouver" },
    // GRUPO H
    { home: "ESP", away: "CPV", date: "2026-06-15", time: "13:00", group: "H", round: "Grupo H - Fecha 1", venue: "Mercedes Benz Stadium, Atlanta" },
    { home: "KSA", away: "URU", date: "2026-06-15", time: "19:00", group: "H", round: "Grupo H - Fecha 1", venue: "Hard Rock Stadium, Miami" },
    { home: "ESP", away: "KSA", date: "2026-06-21", time: "13:00", group: "H", round: "Grupo H - Fecha 2", venue: "Mercedes Benz Stadium, Atlanta" },
    { home: "URU", away: "CPV", date: "2026-06-21", time: "19:00", group: "H", round: "Grupo H - Fecha 2", venue: "Hard Rock Stadium, Miami" },
    { home: "CPV", away: "KSA", date: "2026-06-26", time: "21:00", group: "H", round: "Grupo H - Fecha 3", venue: "NRG Stadium, Houston" },
    { home: "URU", away: "ESP", date: "2026-06-26", time: "21:00", group: "H", round: "Grupo H - Fecha 3", venue: "Estadio Akron, Guadalajara" },
    // GRUPO I
    { home: "FRA", away: "SEN", date: "2026-06-16", time: "16:00", group: "I", round: "Grupo I - Fecha 1", venue: "MetLife Stadium, Nueva Jersey" },
    { home: "FI2", away: "NOR", date: "2026-06-16", time: "19:00", group: "I", round: "Grupo I - Fecha 1", venue: "Gillette Stadium, Boston" },
    { home: "FRA", away: "FI2", date: "2026-06-22", time: "18:00", group: "I", round: "Grupo I - Fecha 2", venue: "Estadio de Philadelphia" },
    { home: "NOR", away: "SEN", date: "2026-06-22", time: "21:00", group: "I", round: "Grupo I - Fecha 2", venue: "MetLife Stadium, Nueva Jersey" },
    { home: "NOR", away: "FRA", date: "2026-06-26", time: "16:00", group: "I", round: "Grupo I - Fecha 3", venue: "Gillette Stadium, Boston" },
    { home: "SEN", away: "FI2", date: "2026-06-26", time: "16:00", group: "I", round: "Grupo I - Fecha 3", venue: "BMO Field, Toronto" },
    // GRUPO J
    { home: "ARG", away: "ALG", date: "2026-06-16", time: "22:00", group: "J", round: "Grupo J - Fecha 1", venue: "Arrowhead Stadium, Kansas" },
    { home: "AUT", away: "JOR", date: "2026-06-16", time: "02:00", group: "J", round: "Grupo J - Fecha 1", venue: "Levi's Stadium, San Francisco" },
    { home: "ARG", away: "AUT", date: "2026-06-22", time: "14:00", group: "J", round: "Grupo J - Fecha 2", venue: "AT&T Stadium, Dallas" },
    { home: "JOR", away: "ALG", date: "2026-06-23", time: "01:00", group: "J", round: "Grupo J - Fecha 2", venue: "Levi's Stadium, San Francisco" },
    { home: "ALG", away: "AUT", date: "2026-06-27", time: "23:00", group: "J", round: "Grupo J - Fecha 3", venue: "Arrowhead Stadium, Kansas" },
    { home: "JOR", away: "ARG", date: "2026-06-27", time: "23:00", group: "J", round: "Grupo J - Fecha 3", venue: "AT&T Stadium, Dallas" },
    // GRUPO K
    { home: "POR", away: "FI1", date: "2026-06-17", time: "14:00", group: "K", round: "Grupo K - Fecha 1", venue: "NRG Stadium, Houston" },
    { home: "UZB", away: "COL", date: "2026-06-17", time: "23:00", group: "K", round: "Grupo K - Fecha 1", venue: "Estadio Azteca, Ciudad de México" },
    { home: "POR", away: "UZB", date: "2026-06-23", time: "14:00", group: "K", round: "Grupo K - Fecha 2", venue: "NRG Stadium, Houston" },
    { home: "FI1", away: "COL", date: "2026-06-23", time: "23:00", group: "K", round: "Grupo K - Fecha 2", venue: "Estadio Akron, Guadalajara" },
    { home: "COL", away: "POR", date: "2026-06-27", time: "20:30", group: "K", round: "Grupo K - Fecha 3", venue: "Hard Rock Stadium, Miami" },
    { home: "FI1", away: "UZB", date: "2026-06-27", time: "20:30", group: "K", round: "Grupo K - Fecha 3", venue: "Mercedes Benz Stadium, Atlanta" },
    // GRUPO L
    { home: "ENG", away: "CRO", date: "2026-06-17", time: "17:00", group: "L", round: "Grupo L - Fecha 1", venue: "AT&T Stadium, Dallas" },
    { home: "GHA", away: "PAN", date: "2026-06-17", time: "20:00", group: "L", round: "Grupo L - Fecha 1", venue: "BMO Field, Toronto" },
    { home: "ENG", away: "GHA", date: "2026-06-23", time: "17:00", group: "L", round: "Grupo L - Fecha 2", venue: "Gillette Stadium, Boston" },
    { home: "PAN", away: "CRO", date: "2026-06-23", time: "20:00", group: "L", round: "Grupo L - Fecha 2", venue: "BMO Field, Toronto" },
    { home: "PAN", away: "ENG", date: "2026-06-27", time: "18:00", group: "L", round: "Grupo L - Fecha 3", venue: "MetLife Stadium, Nueva Jersey" },
    { home: "CRO", away: "GHA", date: "2026-06-27", time: "18:00", group: "L", round: "Grupo L - Fecha 3", venue: "Estadio de Philadelphia" },
  ];

  let matchCount = 0;
  for (const m of groupMatches) {
    const existing = await prisma.match.findFirst({
      where: {
        tournamentId: tournament.id,
        homeTeamId: teamMap[m.home],
        awayTeamId: teamMap[m.away],
        phase: MatchPhase.GROUP,
      },
    });
    if (!existing) {
      await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          homeTeamId: teamMap[m.home],
          awayTeamId: teamMap[m.away],
          phase: MatchPhase.GROUP,
          groupName: m.group,
          roundLabel: m.round,
          venue: m.venue,
          scheduledAt: ar(m.date, m.time),
          status: MatchStatus.PENDING,
        },
      });
      matchCount++;
    }
  }
  console.log(`✅ ${matchCount} group matches seeded`);

  // Knockout placeholders
  const mexId = teamMap["MEX"];
  const usaId = teamMap["USA"];
  const knockoutPhases = [
    ...Array.from({ length: 16 }, (_, i) => ({ phase: MatchPhase.R32, round: `Ronda de 32 - Partido ${i + 1}`, date: "2026-06-29", time: "20:00" })),
    ...Array.from({ length: 8 }, (_, i) => ({ phase: MatchPhase.R16, round: `Ronda de 16 - Partido ${i + 1}`, date: "2026-07-05", time: "20:00" })),
    ...Array.from({ length: 4 }, (_, i) => ({ phase: MatchPhase.QF, round: `Cuartos de Final - Partido ${i + 1}`, date: "2026-07-11", time: "20:00" })),
    { phase: MatchPhase.SF, round: "Semifinal 1", date: "2026-07-15", time: "20:00" },
    { phase: MatchPhase.SF, round: "Semifinal 2", date: "2026-07-16", time: "20:00" },
    { phase: MatchPhase.FINAL, round: "Final", date: "2026-07-19", time: "16:00" },
  ];

  let koCount = 0;
  for (const m of knockoutPhases) {
    const existing = await prisma.match.findFirst({
      where: { tournamentId: tournament.id, roundLabel: m.round, phase: m.phase },
    });
    if (!existing) {
      await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          homeTeamId: mexId,
          awayTeamId: usaId,
          phase: m.phase,
          groupName: null,
          roundLabel: m.round,
          venue: "Por definir",
          scheduledAt: ar(m.date, m.time),
          status: MatchStatus.PENDING,
        },
      });
      koCount++;
    }
  }
  console.log(`✅ ${koCount} knockout placeholders seeded`);

  // 5. Special questions
  const specialQuestions = [
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

  let qCount = 0;
  for (const q of specialQuestions) {
    const existing = await prisma.specialQuestion.findFirst({
      where: { tournamentId: tournament.id, question: q.question },
    });
    if (!existing) {
      await prisma.specialQuestion.create({ data: { ...q, tournamentId: tournament.id } });
      qCount++;
    }
  }
  console.log(`✅ ${qCount} special questions seeded`);

  // 6. Leaderboard entries for approved users
  const approvedUsers = [users[0], users[1], users[2]];
  for (const user of approvedUsers) {
    await prisma.leaderboardEntry.upsert({
      where: { userId_tournamentId_phase: { userId: user.id, tournamentId: tournament.id, phase: "total" } },
      update: {},
      create: { userId: user.id, tournamentId: tournament.id, phase: "total", points: 0 },
    });
  }

  console.log("\n✅ Seed completed!");
  console.log("📋 Admin: admin@loscedros.com / admin123");
  console.log("📋 User (approved): juan@example.com / password123");
  console.log("📋 User (pending): ana@example.com / password123");
  console.log("📋 User (rejected): sofia@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
