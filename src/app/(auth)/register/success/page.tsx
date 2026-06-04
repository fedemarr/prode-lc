import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";

const asesores = [
  { name: "Federico Martínez", phone: "1127056803", display: "11 2705-6803" },
  { name: "Tomás Preo", phone: "1139216179", display: "11 3921-6179" },
];

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1565C0 0%, #1976D2 30%, #2196F3 60%, #1565C0 100%)" }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full border border-white/10" />
        <div className="absolute top-0 left-0 w-[500px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #42A5F5 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Check icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-white/15 border-4 border-white/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="font-outfit text-3xl font-black text-white mb-2">
          ¡Gracias por registrarte!
        </h1>
        <p className="text-white/70 text-sm leading-relaxed mb-6">
          Para activar tu cuenta y participar del Prode Mundial 2026, tenés que realizar el pago hablando con uno de nuestros asesores.
        </p>

        {/* Card */}
        <div className="bg-white/12 backdrop-blur-xl border border-white/25 rounded-2xl p-5 mb-4">
          <p className="text-white/80 text-sm font-semibold mb-4">
            Escribile por WhatsApp a alguno de estos contactos:
          </p>

          <div className="space-y-3">
            {asesores.map((a) => (
              <a key={a.phone}
                href={`https://wa.me/54${a.phone}?text=Hola%20${encodeURIComponent(a.name.split(" ")[0])}%2C%20me%20registr%C3%A9%20en%20el%20Prode%20Mundial%202026%20de%20Club%20Los%20Cedros%20y%20quiero%20realizar%20el%20pago%20para%20activar%20mi%20cuenta.`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-all group">
                <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-semibold text-sm">{a.name}</p>
                  <p className="text-white/55 text-xs">{a.display}</p>
                </div>
                <span className="text-[#25D366] text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                  Escribir →
                </span>
              </a>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs mb-4">
          Una vez que realices el pago, el administrador aprobará tu cuenta y podrás ingresar.
        </p>

        <Link href="/login"
          className="inline-block text-brand-yellow font-bold text-sm hover:text-white transition-colors">
          ← Volver al login
        </Link>
      </div>
    </div>
  );
}
