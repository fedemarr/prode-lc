import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/login");

  const status = session.user.status;
  const role = session.user.role;

  if (role === "ADMIN") return redirect("/admin/dashboard");
  if (status === "APPROVED") return redirect("/dashboard");
  if (status === "PENDING") return redirect("/pending");
  if (status === "REJECTED") return redirect("/rejected");

  return redirect("/login");
}
