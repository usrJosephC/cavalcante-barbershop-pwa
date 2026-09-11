import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDailySummary } from "@/lib/summary";
import { formatCents } from "@/lib/money";
import { formatDateInBusinessTz, shiftDateKey } from "@/lib/business-hours";
import { STATUS_LABELS } from "@/lib/status-labels";
import { AppointmentsList } from "@/components/admin/appointments-list";
import { BarberFilter } from "@/components/admin/barber-filter";

export const metadata: Metadata = { title: "Painel" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: PageProps<"/admin">) {
  const params = await searchParams;
  const dateParam = typeof params?.date === "string" ? params.date : null;
  const barberId = typeof params?.barberId === "string" ? params.barberId : null;
  const [summary, barbers] = await Promise.all([
    getDailySummary(dateParam, barberId),
    prisma.barber.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const prevDate = shiftDateKey(summary.date, -1);
  const nextDate = shiftDateKey(summary.date, 1);
  const [y, m, d] = summary.date.split("-").map(Number);
  const barberQuery = barberId ? `&barberId=${barberId}` : "";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-xl font-semibold uppercase tracking-wide text-gradient-gold">
          Painel do dia
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider">
          <Link
            href={`/admin?date=${prevDate}${barberQuery}`}
            className="min-h-[40px] rounded-sm border border-border px-2.5 py-1.5 flex items-center hover:border-gold hover:text-gold"
          >
            ← Anterior
          </Link>
          <span className="text-muted">{formatDateInBusinessTz(new Date(y, m - 1, d, 12))}</span>
          <Link
            href={`/admin?date=${nextDate}${barberQuery}`}
            className="min-h-[40px] rounded-sm border border-border px-2.5 py-1.5 flex items-center hover:border-gold hover:text-gold"
          >
            Próximo →
          </Link>
          <BarberFilter barbers={barbers} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="steel-border rounded-sm bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Faturado (concluídos)</p>
          <p className="mt-2 text-3xl font-bold text-gold">
            {formatCents(summary.completedRevenueCents)}
          </p>
        </div>
        <div className="steel-border rounded-sm bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Previsto no dia</p>
          <p className="mt-2 text-3xl font-bold">{formatCents(summary.expectedRevenueCents)}</p>
        </div>
        <div className="steel-border rounded-sm bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Atendimentos</p>
          <p className="mt-2 text-3xl font-bold">{summary.appointments.length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(summary.countByStatus).map(([status, count]) => (
          <span
            key={status}
            className="steel-border rounded-sm bg-surface px-3 py-1.5 uppercase tracking-wide text-muted"
          >
            {STATUS_LABELS[status] ?? status}: <span className="text-foreground">{count}</span>
          </span>
        ))}
      </div>

      <div>
        <h2 className="font-heading mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Agendamentos do dia
        </h2>
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
    </div>
  );
}
