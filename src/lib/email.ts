import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = "ProdeClub Los Cedros <prode@loscedros.com>";

export async function sendRegistrationEmail(to: string, name: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Recibimos tu solicitud — Prode Mundial 2026",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00C27C;">¡Hola ${name}!</h2>
        <p>Recibimos tu solicitud para participar en el <strong>Prode Mundial 2026</strong> de Club Los Cedros.</p>
        <p>Te avisamos por este medio cuando tu cuenta sea aprobada por el administrador.</p>
        <p style="color: #888;">Club Los Cedros — Prode Mundial 2026</p>
      </div>
    `,
  });
}

export async function sendApprovalEmail(to: string, name: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "¡Fuiste aprobado! — Prode Mundial 2026",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00C27C;">¡Hola ${name}!</h2>
        <p>¡Fuiste aprobado para participar en el <strong>Prode Mundial 2026</strong> de Club Los Cedros!</p>
        <p>Ya podés ingresar a la plataforma y hacer tus pronósticos.</p>
        <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/login" style="display: inline-block; background: #00C27C; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Ingresar al Prode</a>
        <p style="color: #888; margin-top: 24px;">Club Los Cedros — Prode Mundial 2026</p>
      </div>
    `,
  });
}

export async function sendRejectionEmail(to: string, name: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Solicitud no aprobada — Prode Mundial 2026",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF453A;">Hola ${name}</h2>
        <p>Tu solicitud para participar en el <strong>Prode Mundial 2026</strong> de Club Los Cedros no fue aprobada en esta oportunidad.</p>
        <p>Consultá con el administrador del club para más información.</p>
        <p style="color: #888;">Club Los Cedros — Prode Mundial 2026</p>
      </div>
    `,
  });
}
