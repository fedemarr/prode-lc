import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AR_TZ = "America/Argentina/Buenos_Aires";

function arParts(date: Date, opts: Intl.DateTimeFormatOptions) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: AR_TZ, ...opts })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const p = arParts(d, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const p = arParts(d, { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${p.day}/${p.month}/${p.year}`;
}

export function formatTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const p = arParts(d, { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${p.hour}:${p.minute}`;
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
