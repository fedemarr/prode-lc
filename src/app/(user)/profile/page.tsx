import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogOut, User, Mail, Phone, Trophy } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true },
  });

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-outfit text-2xl font-bold text-white">Mi Perfil</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-[#00C27C]/20 border-2 border-[#00C27C]/40 flex items-center justify-center mb-3">
          <span className="font-outfit text-3xl font-bold text-[#00C27C]">
            {user?.firstName[0]}{user?.lastName[0]}
          </span>
        </div>
        <h2 className="font-outfit text-xl font-bold text-white">
          {user?.firstName} {user?.lastName}
        </h2>
        <p className="text-white/40 text-sm">Socio del Prode Mundial 2026</p>
      </div>

      {/* Info */}
      <div className="bg-[#1A2235] border border-white/8 rounded-2xl p-5 space-y-4 mb-4">
        <InfoRow icon={<User className="w-4 h-4" />} label="Nombre" value={`${user?.firstName} ${user?.lastName}`} />
        <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user?.email ?? ""} />
        <InfoRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={user?.phone ?? ""} />
        <InfoRow icon={<Trophy className="w-4 h-4" />} label="Miembro desde" value={user?.createdAt.toLocaleDateString("es-AR") ?? ""} />
      </div>

      <SignOutButton />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-white/30">{icon}</div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  );
}
