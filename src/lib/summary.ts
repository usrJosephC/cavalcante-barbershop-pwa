import { prisma } from "@/lib/prisma";
import { dateKeyInBusinessTz } from "@/lib/appointments";

export async function getDailySummary(dateParam?: string | null, barberId?: string | null) {
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const date = dateParam && DATE_RE.test(dateParam) ? dateParam : dateKeyInBusinessTz(new Date());

  const [year, month, day] = date.split("-").map(Number);
  const dayStart = new Date(year, month - 1, day, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: dayStart, lte: dayEnd },
      ...(barberId ? { barberId } : {}),
    },
    orderBy: { startsAt: "asc" },
    include: { client: true, service: true, barber: true },
  });

  const completedRevenueCents = appointments
    .filter((a) => a.status === "COMPLETED")
    .reduce((sum, a) => sum + a.priceCentsAtBooking, 0);

  const expectedRevenueCents = appointments
    .filter((a) => a.status === "SCHEDULED" || a.status === "CONFIRMED" || a.status === "COMPLETED")
    .reduce((sum, a) => sum + a.priceCentsAtBooking, 0);

  const countByStatus = appointments.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return { date, completedRevenueCents, expectedRevenueCents, countByStatus, appointments };
}
