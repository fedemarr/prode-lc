import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#00C27C]/20 text-[#00C27C] border border-[#00C27C]/30",
        secondary: "bg-white/10 text-white/70",
        destructive: "bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30",
        amber: "bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30",
        outline: "border border-white/20 text-white/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
