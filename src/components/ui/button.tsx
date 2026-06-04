import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "cedros-gradient text-white hover:opacity-90 shadow-lg shadow-brand-blue/25 border-0",
        destructive: "bg-brand-red text-white hover:bg-red-600",
        outline: "border border-white/12 bg-transparent hover:bg-white/5 text-white",
        secondary: "bg-[#162035] text-white hover:bg-[#1c2a44] border border-white/8",
        ghost: "hover:bg-white/5 text-white",
        link: "text-brand-yellow underline-offset-4 hover:underline",
        amber: "bg-brand-yellow text-[#080C18] hover:bg-brand-yellow-light font-bold",
        blue: "bg-brand-blue text-white hover:bg-brand-blue-light",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
