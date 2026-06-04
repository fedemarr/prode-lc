import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-blue/20 text-brand-yellow border border-brand-blue/30",
        secondary: "bg-white/8 text-white/60 border border-white/10",
        destructive: "bg-brand-red/20 text-red-400 border border-brand-red/30",
        amber: "bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30",
        outline: "border border-white/15 text-white/60",
        success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
