import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ClientsExplorer } from "@/components/admin/clients-explorer";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      appointments: { orderBy: { startsAt: "desc" }, take: 1, select: { startsAt: true } },
      _count: { select: { appointments: true } },
    },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-xl font-semibold uppercase tracking-wide text-gradient-gold">
        Clientes
      </h1>
      <ClientsExplorer
        initialClients={clients.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          notes: c.notes,
          totalAppointments: c._count.appointments,
          lastVisit: c.appointments[0]?.startsAt.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
