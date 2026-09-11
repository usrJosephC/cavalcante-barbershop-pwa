import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BarbersManager } from "@/components/admin/barbers-manager";

export const metadata: Metadata = { title: "Barbeiros" };
export const dynamic = "force-dynamic";

export default async function BarbeirosPage() {
  const barbers = await prisma.barber.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-semibold uppercase tracking-wide text-gradient-gold">
        Barbeiros
      </h1>
      <BarbersManager initialBarbers={barbers} />
    </div>
  );
}
