import { Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="text-center space-y-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/30 mb-2">
        <Clock className="w-10 h-10 text-[#FFB800]" />
      </div>

      <div>
        <h1 className="font-outfit text-3xl font-bold text-white mb-2">
          Solicitud enviada
        </h1>
        <p className="text-white/60 text-lg">
          Tu cuenta está siendo revisada por el administrador del club.
        </p>
        <p className="text-white/40 text-sm mt-2">
          Te avisamos por email cuando sea aprobada.
        </p>
      </div>

      <div className="bg-[#1A2235] border border-[#FFB800]/20 rounded-2xl p-6 text-left space-y-3">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-[#00C27C]" />
          <span className="font-medium text-white">Prode Mundial 2026</span>
        </div>
        <p className="text-white/50 text-sm">
          Mientras esperás la aprobación, preparate: el Mundial arranca el 11 de junio de 2026 con 48 selecciones y 104 partidos.
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/login">Volver al inicio</Link>
      </Button>
    </div>
  );
}
