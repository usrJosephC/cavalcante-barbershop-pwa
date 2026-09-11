import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDailySummary } from "@/lib/summary";
import { formatDateInBusinessTz, shiftDateKey } from "@/lib/business-hours";
import { AppointmentsList } from "@/components/admin/appointments-list";
import { AddWalkInForm } from "@/components/admin/add-walkin-form";
import { BarberFilter } from "@/components/admin/barber-filter";

export const metadata: Metadata = { title: "Agenda" };
export const dynamic = "force-dynamic";

export default async function AgendaPage({ searchParams }: PageProps<"/admin/agenda">) {
  const params = await searchParams;
  const dateParam = typeof params?.date === "string" ? params.date : null;
  const barberId = typeof params?.barberId === "string" ? params.barberId : null;
  const [summary, services, barbers] = await Promise.all([
    getDailySummary(dateParam, barberId),
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
  const prevDate = shiftDateKey(summary.date, -1);
  const nextDate = shiftDateKey(summary.date, 1);
  const [y, m, d] = summary.date.split("-").map(Number);
  const barberQuery = barberId ? `&barberId=${barberId}` : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-xl font-semibold uppercase tracking-wide text-gradient-gold">
          Agenda
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider">
          <Link
            href={`/admin/agenda?date=${prevDate}${barberQuery}`}
            className="flex min-h-[40px] items-center rounded-sm border border-border px-2.5 py-1.5 hover:border-gold hover:text-gold"
          >
            ← Anterior
          </Link>
          <span className="text-muted">{formatDateInBusinessTz(new Date(y, m - 1, d, 12))}</span>
          <Link
            href={`/admin/agenda?date=${nextDate}${barberQuery}`}
            className="flex min-h-[40px] items-center rounded-sm border border-border px-2.5 py-1.5 hover:border-gold hover:text-gold"
          >
            Próximo →
          </Link>
          <BarberFilter barbers={barbers} />
        </div>
      </div>

      <AddWalkInForm services={services} barbers={barbers} date={summary.date} />

      <AppointmentsList
        initialAppointments={summary.appointments.map((a) => ({
          id: a.id,
          startsAt: a.startsAt.toISOString(),
          status: a.status,
          priceCents: a.priceCentsAtBooking,
          clientName: a.client.name,
          clientPhone: a.client.phone,
          serviceName: a.service.name,
          barberName: a.barber.name,
        }))}
      />
    </div>
  );
}
