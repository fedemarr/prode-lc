import { prisma } from "@/lib/prisma";
import { ParticipantActions } from "@/components/participant-actions";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Download } from "lucide-react";

export default async function ParticipantsPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status;
  const where: any = { role: "USER" };
  if (status && status !== "all") where.status = status;

  const participants = await prisma.user.findMany({
    where, orderBy: { createdAt: "desc" },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, createdAt: true, _count: { select: { predictions: true } } },
  });

  const counts = await prisma.user.groupBy({ by: ["status"], where: { role: "USER" }, _count: true });
  const countByStatus = counts.reduce((acc, c) => { acc[c.status] = c._count; return acc; }, {} as Record<string, number>);
  const total = Object.values(countByStatus).reduce((a, b) => a + b, 0);

  const tabs = [
    { label: "Todos", value: "all", count: total },
    { label: "Pendientes", value: "PENDING", count: countByStatus.PENDING ?? 0 },
    { label: "Aprobados", value: "APPROVED", count: countByStatus.APPROVED ?? 0 },
    { label: "Rechazados", value: "REJECTED", count: countByStatus.REJECTED ?? 0 },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Participantes</h1>
          <p className="text-white/40 text-sm mt-0.5">{participants.length} registros</p>
        </div>
        <a href="/api/admin/export/participants"
          className="flex items-center gap-2 px-4 py-2 bg-[#0F1A2E] border border-white/10 rounded-lg text-sm text-white/60 hover:text-white hover:border-white/20 transition-all self-start sm:self-auto">
          <Download className="w-4 h-4" /> Exportar Excel
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map((tab) => (
          <Link key={tab.value} href={`/admin/participants${tab.value !== "all" ? `?status=${tab.value}` : ""}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              (status ?? "all") === tab.value ? "cedros-gradient text-white" : "bg-[#0F1A2E] text-white/50 hover:text-white border border-white/8"
            }`}>
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${(status ?? "all") === tab.value ? "bg-white/20" : "bg-white/10"}`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Cards on mobile, table on desktop */}
      {participants.length === 0 ? (
        <div className="text-center text-white/30 py-12">No hay participantes en esta categoría</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {participants.map((p) => (
              <div key={p.id} className="bg-[#0F1A2E] border border-white/8 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{p.email}</p>
                    <p className="text-xs text-white/30 mt-0.5">{p.phone}</p>
                  </div>
                  <Badge variant={p.status === "APPROVED" ? "default" : p.status === "PENDING" ? "amber" : "destructive"} className="flex-shrink-0">
                    {p.status === "APPROVED" ? "Aprobado" : p.status === "PENDING" ? "Pendiente" : "Rechazado"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/25">{p._count.predictions} pronósticos · {formatDateTime(p.createdAt)}</span>
                  <ParticipantActions participantId={p.id} status={p.status} phone={p.phone} name={`${p.firstName} ${p.lastName}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-[#0F1A2E] border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Nombre", "Email", "Teléfono", "Registro", "Estado", "Acciones"].map(h => (
                      <th key={h} className="text-left p-4 text-xs font-semibold text-white/35 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium text-white">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-white/35">{p._count.predictions} pronósticos</p>
                      </td>
                      <td className="p-4 text-sm text-white/60">{p.email}</td>
                      <td className="p-4 text-sm text-white/60">{p.phone}</td>
                      <td className="p-4 text-xs text-white/35">{formatDateTime(p.createdAt)}</td>
                      <td className="p-4">
                        <Badge variant={p.status === "APPROVED" ? "default" : p.status === "PENDING" ? "amber" : "destructive"}>
                          {p.status === "APPROVED" ? "Aprobado" : p.status === "PENDING" ? "Pendiente" : "Rechazado"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <ParticipantActions participantId={p.id} status={p.status} phone={p.phone} name={`${p.firstName} ${p.lastName}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
