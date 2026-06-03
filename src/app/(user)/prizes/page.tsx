import { Trophy, Star } from "lucide-react";

export default function PrizesPage() {
  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Premios</h1>
        <p className="text-white/50 text-sm mt-1">Premios del Prode Mundial 2026</p>
      </div>

      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-6 text-center">
        <Trophy className="w-16 h-16 text-[#FFB800] mx-auto mb-4" />
        <h2 className="font-outfit text-xl font-bold text-white mb-2">
          Información de premios
        </h2>
        <p className="text-white/50 text-sm">
          Los premios serán publicados por el administrador del club próximamente.
        </p>
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/40 text-sm">
            Seguí compitiendo y acumulando puntos para estar en el podio del Prode Mundial 2026 de Club Los Cedros.
          </p>
        </div>
      </div>
    </div>
  );
}
