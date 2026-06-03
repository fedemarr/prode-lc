import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RejectedPage() {
  return (
    <div className="text-center space-y-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FF453A]/20 border border-[#FF453A]/30">
        <XCircle className="w-10 h-10 text-[#FF453A]" />
      </div>

      <div>
        <h1 className="font-outfit text-3xl font-bold text-white mb-2">
          Solicitud no aprobada
        </h1>
        <p className="text-white/60 text-lg">
          Tu solicitud para participar en el Prode Mundial 2026 no fue aprobada en esta oportunidad.
        </p>
        <p className="text-white/40 text-sm mt-2">
          Consultá con el administrador del club para más información.
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/login">Volver al inicio</Link>
      </Button>
    </div>
  );
}
