import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ServicesManager } from "@/components/admin/services-manager";

export const metadata: Metadata = { title: "Serviços" };
export const dynamic = "force-dynamic";

export default async function ServicosPage() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-semibold uppercase tracking-wide text-gradient-gold">
        Serviços
      </h1>
      <ServicesManager initialServices={services} />
    </div>
  );
}
