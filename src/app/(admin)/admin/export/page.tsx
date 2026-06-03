import { Download, Users, Trophy, FileSpreadsheet } from "lucide-react";

export default function AdminExportPage() {
  const exports = [
    {
      href: "/api/admin/export/participants",
      icon: Users,
      title: "Lista de Participantes",
      description: "Exportar todos los participantes con estado y fecha de registro",
      color: "blue",
    },
    {
      href: "/api/admin/export/ranking",
      icon: Trophy,
      title: "Ranking General",
      description: "Exportar la tabla de posiciones con puntos y aciertos",
      color: "green",
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Exportación</h1>
        <p className="text-white/50 text-sm mt-1">Descargá reportes en formato Excel</p>
      </div>

      <div className="grid gap-4">
        {exports.map(({ href, icon: Icon, title, description, color }) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-4 bg-[#1A2235] border border-white/8 rounded-xl p-5 hover:border-white/20 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              color === "blue" ? "bg-blue-500/20" : "bg-[#00C27C]/20"
            }`}>
              <Icon className={`w-6 h-6 ${color === "blue" ? "text-blue-400" : "text-[#00C27C]"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{title}</h3>
              <p className="text-sm text-white/40 mt-0.5">{description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/40 group-hover:text-[#00C27C] transition-colors">
              <Download className="w-4 h-4" />
              <span>.xlsx</span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 bg-[#FFB800]/10 border border-[#FFB800]/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileSpreadsheet className="w-4 h-4 text-[#FFB800]" />
          <p className="text-sm font-medium text-[#FFB800]">Tip</p>
        </div>
        <p className="text-xs text-white/50">
          Los archivos Excel están formateados con encabezados de color y son compatibles con Microsoft Excel, Google Sheets y LibreOffice Calc.
        </p>
      </div>
    </div>
  );
}
