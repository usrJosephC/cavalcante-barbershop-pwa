import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = { title: "Agendar horário" };
export const dynamic = "force-dynamic";

export default async function AgendarPage() {
  const [services, barbers] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { priceCents: "asc" },
      select: { id: true, name: true, priceCents: true, durationMinutes: true },
    }),
    prisma.barber.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
        <h1 className="font-heading text-center text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
          Agendar horário
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Escolha o barbeiro, o serviço, o dia e o horário. Sem necessidade de cadastro.
        </p>
        <div className="mt-8">
          <BookingWizard services={services} barbers={barbers} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
