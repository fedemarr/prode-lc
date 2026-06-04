import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminMobileHeader } from "@/components/admin-mobile-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-[#060A14]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <AdminMobileHeader />
      </div>
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
