import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserNav, UserSidebar } from "@/components/user-nav";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) return redirect("/login");
  if (session.user.status === "PENDING") return redirect("/pending");
  if (session.user.status === "REJECTED") return redirect("/rejected");

  return (
    <div className="flex min-h-screen bg-[#080C18]">
      <UserSidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 overflow-x-hidden">
        {children}
      </main>
      <UserNav />
    </div>
  );
}
