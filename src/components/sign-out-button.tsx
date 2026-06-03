"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="w-full border-[#FF453A]/30 text-[#FF453A] hover:bg-[#FF453A]/10"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Cerrar sesión
    </Button>
  );
}
