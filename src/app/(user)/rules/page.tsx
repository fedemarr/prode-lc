import { Trophy, Target, HelpCircle, Gamepad2, AlertCircle } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full space-y-5">
      <div className="mb-2">
        <h1 className="font-outfit text-2xl font-bold text-white">Reglas del Juego</h1>
        <p className="text-white/40 text-sm mt-1">Cómo se calculan los puntos y cómo funcionan los pronósticos</p>
      </div>

      {/* Mecánica */}
      <Section icon={<Gamepad2 className="w-5 h-5 text-brand-yellow" />} title="Mecánica del juego">
        <ul className="space-y-2">
          {[
            "En la fase de grupos se usa el resultado al final del partido para calcular los puntos.",
            "En las rondas finales (octavos, cuartos, semis, final) se usa el resultado al final del tiempo reglamentario, sin contar alargue ni penales.",
            "Los goles convertidos en penales no se tienen en cuenta para la puntuación.",
            "Si no cargás un pronóstico para un partido, no sumás puntos en ese partido.",
            "Cada pronóstico se puede enviar UNA SOLA VEZ. Una vez confirmado, no se puede modificar.",
            "El cierre de pronósticos es automático al inicio de cada partido.",
          ].map((t, i) => <Rule key={i} text={t} />)}
        </ul>
      </Section>

      {/* Puntuación */}
      <Section icon={<Trophy className="w-5 h-5 text-brand-yellow" />} title="Puntuación">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <ScoreCard pts={5} label="Puntuación exacta" sub="Por acertar el marcador exacto" color="yellow" />
          <ScoreCard pts={2} label="Puntuación parcial" sub="Por acertar ganador o empate" color="blue" />
          <ScoreCard pts={0} label="Sin puntos" sub="Por no acertar el resultado" color="gray" />
        </div>
        <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm text-white/70">
          <p>• Si acertás el marcador exacto (ej: pronosticás <strong className="text-white">2-1</strong> y termina <strong className="text-white">2-1</strong>), obtenés <strong className="text-brand-yellow">5 puntos</strong>.</p>
          <p>• Si acertás el ganador o el empate pero no el marcador (ej: pronosticás <strong className="text-white">3-1</strong> y termina <strong className="text-white">1-0</strong>), obtenés <strong className="text-brand-blue-light">2 puntos</strong>.</p>
          <p>• Si no acertás el resultado, obtenés <strong className="text-white/40">0 puntos</strong>.</p>
        </div>
      </Section>

      {/* Pronósticos especiales */}
      <Section icon={<Target className="w-5 h-5 text-brand-yellow" />} title="Pronósticos Especiales">
        <ul className="space-y-2">
          {[
            "Los pronósticos especiales (Campeón, Goleador, etc.) se cargan ANTES de que empiece el torneo.",
            "Una vez iniciado el Mundial (11 de junio), el formulario de pronósticos especiales se cierra automáticamente.",
            "Cada pregunta especial tiene un puntaje asignado por el administrador.",
            "Los resultados de los pronósticos especiales se resuelven al final del torneo.",
          ].map((t, i) => <Rule key={i} text={t} />)}
        </ul>
      </Section>

      {/* Empates */}
      <Section icon={<AlertCircle className="w-5 h-5 text-brand-yellow" />} title="En caso de empate en el ranking">
        <p className="text-sm text-white/60 mb-3">Si varios jugadores tienen la misma cantidad de puntos, el ranking se desempata por este orden:</p>
        <ol className="space-y-1.5">
          {[
            "Mayor cantidad de pronósticos exactos (5 pts).",
            "Mayor cantidad de pronósticos de resultado (2 pts).",
            "Quien cargó sus pronósticos antes.",
            "Si todavía persiste el empate, fecha de creación de cuenta.",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
              <span className="w-5 h-5 rounded-full bg-brand-blue/30 border border-brand-blue/50 text-brand-yellow text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </Section>

      {/* FAQ */}
      <Section icon={<HelpCircle className="w-5 h-5 text-brand-yellow" />} title="Preguntas frecuentes">
        <div className="space-y-4">
          <FAQ q="¿Qué pasa si acierto el resultado exacto?"
            a='Resultado final: 2-0. Tu pronóstico: 2-0. Obtenés 5 puntos por puntuación exacta.' />
          <FAQ q="¿Qué pasa si acierto el ganador pero no el marcador exacto?"
            a='Resultado final: 2-0. Tu pronóstico: 3-1. Obtenés 2 puntos por puntuación parcial.' />
          <FAQ q="¿Qué pasa si no acierto el resultado?"
            a='Resultado final: 2-1. Tu pronóstico: 0-1. Obtenés 0 puntos.' />
          <FAQ q="¿Puedo modificar mi pronóstico?"
            a='No. Cada pronóstico se puede enviar una sola vez. Una vez confirmado, no se puede cambiar.' />
          <FAQ q="¿Hasta cuándo puedo cargar mi pronóstico?"
            a='Hasta el momento exacto en que comienza el partido. El sistema lo cierra automáticamente.' />
          <FAQ q="¿Qué pasa si no cargo un pronóstico?"
            a='Simplemente no sumás puntos en ese partido. No hay penalidad.' />
        </div>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#0F1A2E] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center">{icon}</div>
        <h2 className="font-outfit font-bold text-white text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Rule({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-white/65">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow mt-1.5 flex-shrink-0" />
      {text}
    </li>
  );
}

function ScoreCard({ pts, label, sub, color }: { pts: number; label: string; sub: string; color: string }) {
  const styles = {
    yellow: "border-brand-yellow/30 bg-brand-yellow/10",
    blue: "border-brand-blue-light/30 bg-brand-blue/10",
    gray: "border-white/10 bg-white/5",
  }[color];
  const textColor = { yellow: "text-brand-yellow", blue: "text-brand-blue-light", gray: "text-white/30" }[color];
  return (
    <div className={`rounded-xl border p-3 text-center ${styles}`}>
      <p className={`font-outfit text-3xl font-black ${textColor}`}>+{pts}</p>
      <p className="text-white text-xs font-semibold mt-1">{label}</p>
      <p className="text-white/40 text-[10px] mt-0.5">{sub}</p>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-white/6 pb-4 last:border-0 last:pb-0">
      <p className="text-sm font-semibold text-white mb-1">¿{q.replace(/^¿/, "")}</p>
      <p className="text-sm text-white/55">{a}</p>
    </div>
  );
}
