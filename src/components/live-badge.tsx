"use client";

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-red/20 border border-brand-red/40 text-red-400 text-xs font-bold tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      EN VIVO
    </span>
  );
}
