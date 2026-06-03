import { prisma } from "@/lib/prisma";
import { ParticipantActions } from "@/components/participant-actions";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Download } from "lucide-react";

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const where: any = { role: "USER" };
  if (status && status !== "all") where.status = status;

  const participants = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      _count: { select: { predictions: true } },
    },
  });

  const counts = await prisma.user.groupBy({
    by: ["status"],
    where: { role: "USER" },
    _count: true,
  });

  const countByStatus = counts.reduce((acc, c) => {
    acc[c.status] = c._count;
    return acc;
  }, {} as Record<string, number>);

  const tabs = [
    { label: "Todos", value: "all", count: Object.values(countByStatus).reduce((a, b) => a + b, 0) },
    { label: "Pendientes", value: "PENDING", count: countByStatus.PENDING ?? 0 },
    { label: "Aprobados", value: "APPROVED", count: countByStatus.APPROVED ?? 0 },
    { label: "Rechazados", value: "REJECTED", count: countByStatus.REJECTED ?? 0 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-white">Participantes</h1>
          <p className="text-white/50 text-sm mt-1">{participants.length} registros</p>
        </div>
        <a
          href="/api/admin/export/participants"
          className="flex items-center gap-2 px-4 py-2 bg-[#1A2235] border border-white/10 rounded-lg text-sm text-white/70 hover:text-white hover:border-white/20 transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar Excel
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/participants${tab.value !== "all" ? `?status=${tab.value}` : ""}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              (status ?? "all") === tab.value
                ? "bg-[#00C27C] text-white"
                : "bg-[#1A2235] text-white/50 hover:text-white"
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              (status ?? "all") === tab.value ? "bg-white/20" : "bg-white/10"
            }`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl overflow-hidden">
        {participants.length === 0 ? (
          <div className="text-center text-white/40 py-12">No hay participantes en esta categoría</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Nombre</th>
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Email</th>
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">Teléfono</th>
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider hidden lg:table-cell">Registro</th>
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Estado</th>
                  <th className="text-right p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-white/5 last:border-0 ${i % 2 === 0 ? "" : "bg-white/2"}`}
                  >
                    <td className="p-4">
                      <p className="text-sm font-medium text-white">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-white/40">{p._count.predictions} pronósticos</p>
                    </td>
                    <td className="p-4 text-sm text-white/70">{p.email}</td>
                    <td className="p-4 text-sm text-white/70 hidden md:table-cell">{p.phone}</td>
                    <td className="p-4 text-xs text-white/40 hidden lg:table-cell">{formatDateTime(p.createdAt)}</td>
                    <td className="p-4">
                      <Badge
                        variant={
                          p.status === "APPROVED" ? "default" : p.status === "PENDING" ? "amber" : "destructive"
                        }
                      >
                        {p.status === "APPROVED" ? "Aprobado" : p.status === "PENDING" ? "Pendiente" : "Rechazado"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <ParticipantActions
                        participantId={p.id}
                        status={p.status}
                        phone={p.phone}
                        name={`${p.firstName} ${p.lastName}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
