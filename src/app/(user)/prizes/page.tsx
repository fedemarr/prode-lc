import { Trophy, Gift, Users, Ticket } from "lucide-react";
import Image from "next/image";

const premiosCompleto = [
  { pos: "1°", premio: "Smart TV Noblex 50\" 4K" },
  { pos: "2°", premio: "Cafetera Nespresso" },
  { pos: "3°", premio: "Parlante JBL Flip 6" },
  { pos: "4°", premio: "Caja de Vinos Luigi Bosca de Sangre" },
  { pos: "5°", premio: "Camiseta de Rugby a Elección" },
];

const premiosGrupos = [
  { pos: "1°", premio: "Airfryer Peabody 5.2 lts." },
  { pos: "2°", premio: "Pistola Masajeadora" },
  { pos: "3°", premio: "Parlante JBL Go" },
  { pos: "4°", premio: "Almuerzo para 2 personas en el Restaurant del Club" },
  { pos: "5°", premio: "Short + Medias del Club" },
];

export default function PrizesPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-5">
      <div className="mb-2">
        <h1 className="font-outfit text-2xl font-bold text-white">Premios</h1>
        <p className="text-white/40 text-sm mt-1">Lo que podés ganar participando del Prode Mundial 2026</p>
      </div>

      {/* Banner motivacional */}
      <div className="cedros-gradient rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border-2 border-white" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-brand-yellow" />
            </div>
            <div>
              <h2 className="font-outfit font-black text-white text-lg leading-tight">
                PRODE MUNDIAL 2026
              </h2>
              <p className="text-brand-yellow font-bold text-sm mt-0.5">
                AYUDANOS, PRONOSTICÁ Y GANÁ
              </p>
              <p className="text-white/70 text-sm mt-2 leading-relaxed">
                Tu pronóstico puede llevarnos a Europa. Sumate al prode del Mundial, disfrutá de cada partido y colaborá con la gira del club.
              </p>
              <p className="text-white font-bold text-sm mt-2">
                ¡PARTICIPÁ, ACERTÁ RESULTADOS Y COMPETÍ POR IMPORTANTES PREMIOS!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Valor por chance */}
      <div className="bg-[#0F1A2E] border border-brand-yellow/30 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-brand-yellow/15 border border-brand-yellow/30 flex items-center justify-center flex-shrink-0">
          <Ticket className="w-7 h-7 text-brand-yellow" />
        </div>
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wider font-semibold">Valor por chance</p>
          <p className="font-outfit text-4xl font-black text-brand-yellow">$15.000</p>
          <p className="text-white/40 text-xs mt-0.5">Cuando más juegues, más chances tenés</p>
        </div>
      </div>

      {/* Grid premios */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Prode Completo */}
        <div className="bg-[#0F1A2E] border border-brand-yellow/20 rounded-2xl overflow-hidden">
          <div className="cedros-gradient px-4 py-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-brand-yellow" />
            <h3 className="font-outfit font-black text-white text-sm uppercase tracking-wide">Prode Completo</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {premiosCompleto.map(({ pos, premio }) => (
              <div key={pos} className="flex items-center gap-3">
                <span className="font-outfit font-black text-brand-yellow text-sm w-6 flex-shrink-0">{pos}</span>
                <span className="text-sm text-white/80">{premio}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fase de Grupos */}
        <div className="bg-[#0F1A2E] border border-brand-blue-light/20 rounded-2xl overflow-hidden">
          <div className="bg-brand-blue px-4 py-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <h3 className="font-outfit font-black text-white text-sm uppercase tracking-wide">Fase de Grupos</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {premiosGrupos.map(({ pos, premio }) => (
              <div key={pos} className="flex items-center gap-3">
                <span className="font-outfit font-black text-brand-blue-light text-sm w-6 flex-shrink-0">{pos}</span>
                <span className="text-sm text-white/80">{premio}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl p-4">
        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          <Image src="/logo.png" alt="Club Los Cedros" width={40} height={40} className="object-contain w-full h-full" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Club Los Cedros</p>
          <p className="text-white/40 text-xs">Rumbo a la gira a Europa · Que arranque el Mundial 🇮🇹🇪🇸🇵🇹</p>
        </div>
      </div>
    </div>
  );
}
