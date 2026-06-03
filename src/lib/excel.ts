import ExcelJS from "exceljs";

const HEADER_STYLE: Partial<ExcelJS.Style> = {
  font: { bold: true, color: { argb: "FFFFFFFF" } },
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF00C27C" } },
  alignment: { horizontal: "center" },
};

export async function generateParticipantsExcel(participants: any[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Participantes");

  ws.columns = [
    { header: "Nombre", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Teléfono", key: "phone", width: 18 },
    { header: "Estado", key: "status", width: 15 },
    { header: "Registro", key: "createdAt", width: 20 },
  ];

  ws.getRow(1).eachCell((cell) => {
    Object.assign(cell, HEADER_STYLE);
  });

  for (const p of participants) {
    ws.addRow({
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      phone: p.phone,
      status: p.status,
      createdAt: new Date(p.createdAt).toLocaleDateString("es-AR"),
    });
  }

  return wb.xlsx.writeBuffer();
}

export async function generateRankingExcel(entries: any[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Ranking");

  ws.columns = [
    { header: "Posición", key: "rank", width: 12 },
    { header: "Participante", key: "name", width: 25 },
    { header: "Puntos", key: "points", width: 12 },
    { header: "Exactos", key: "exactHits", width: 12 },
    { header: "Resultados", key: "winnerHits", width: 14 },
    { header: "% Aciertos", key: "accuracy", width: 14 },
  ];

  ws.getRow(1).eachCell((cell) => {
    Object.assign(cell, HEADER_STYLE);
  });

  for (const e of entries) {
    const total = (e.exactHits ?? 0) + (e.winnerHits ?? 0);
    const played = e.totalPredictions ?? 0;
    ws.addRow({
      rank: e.rankPosition,
      name: e.userName,
      points: e.points,
      exactHits: e.exactHits,
      winnerHits: e.winnerHits,
      accuracy: played > 0 ? `${Math.round((total / played) * 100)}%` : "-",
    });
  }

  return wb.xlsx.writeBuffer();
}

export async function generatePredictionsExcel(data: any[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Pronósticos");

  ws.columns = [
    { header: "Participante", key: "user", width: 25 },
    { header: "Partido", key: "match", width: 35 },
    { header: "Fecha", key: "date", width: 20 },
    { header: "Pronóstico", key: "prediction", width: 15 },
    { header: "Resultado Real", key: "result", width: 15 },
    { header: "Tipo", key: "type", width: 12 },
    { header: "Puntos", key: "points", width: 10 },
  ];

  ws.getRow(1).eachCell((cell) => {
    Object.assign(cell, HEADER_STYLE);
  });

  for (const d of data) {
    ws.addRow(d);
  }

  return wb.xlsx.writeBuffer();
}
