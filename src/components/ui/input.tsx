import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-white/10 bg-[#1A2235] px-3 py-2 text-sm text-white placeholder:text-white/30",
          "focus:outline-none focus:ring-2 focus:ring-[#00C27C] focus:border-[#00C27C]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
