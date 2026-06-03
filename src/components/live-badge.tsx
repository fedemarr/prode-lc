"use client";

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF453A]/20 border border-[#FF453A]/40 text-[#FF453A] text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse" />
      EN VIVO
    </span>
  );
}
