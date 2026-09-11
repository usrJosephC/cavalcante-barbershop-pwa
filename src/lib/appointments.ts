import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, isBusinessOpenOn, TIMEZONE } from "@/lib/business-hours";

export class BookingError extends Error {
  status: number;
  constructor(message: string, status = 409) {
    super(message);
    this.status = status;
  }
}

export function dateKeyInBusinessTz(date: Date): string {
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd");
}

/**
 * Cria um agendamento validando novamente (no servidor) que o horário está dentro do
 * expediente e livre de conflitos NA AGENDA DO BARBEIRO ESCOLHIDO (cada barbeiro tem sua
 * própria agenda; dois barbeiros podem atender no mesmo horário). Usado tanto pelo fluxo
 * público de agendamento quanto pelo painel do admin (para encaixes/atendimentos avulsos).
 */
export async function createAppointment({
  clientName,
  clientPhone,
  serviceId,
  barberId,
  startsAt,
  notes,
  allowPastNotice = false,
}: {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  barberId: string;
  startsAt: Date;
  notes?: string;
  /** Permite ao admin criar um encaixe sem respeitar a antecedência mínima de agendamento online. */
  allowPastNotice?: boolean;
}) {
  const [service, barber] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.barber.findUnique({ where: { id: barberId } }),
  ]);
  if (!service || !service.active) {
    throw new BookingError("Serviço não encontrado.", 404);
  }
  if (!barber || !barber.active) {
    throw new BookingError("Barbeiro não encontrado.", 404);
  }

  const dateStr = dateKeyInBusinessTz(startsAt);
  if (!isBusinessOpenOn(dateStr)) {
    throw new BookingError("A barbearia está fechada nesse dia.");
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const dayStart = new Date(year, month - 1, day, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      startsAt: { gte: dayStart, lte: dayEnd },
      status: { notIn: ["CANCELED", "NO_SHOW"] },
    },
    select: { startsAt: true, endsAt: true },
  });

  const hasConflict = existingAppointments.some(
    (appt) => startsAt < appt.endsAt && new Date(startsAt.getTime() + service.durationMinutes * 60_000) > appt.startsAt
  );
  if (hasConflict) {
    throw new BookingError("Esse horário já está ocupado para esse barbeiro.");
  }

  if (!allowPastNotice) {
    const availableSlots = getAvailableSlots({
      dateStr,
      durationMinutes: service.durationMinutes,
      existingAppointments,
    });
    const isSlotStillAvailable = availableSlots.some((slot) => slot.getTime() === startsAt.getTime());
    if (!isSlotStillAvailable) {
      throw new BookingError("Esse horário acabou de ficar indisponível. Escolha outro.");
    }
  }

  const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

  const client = await prisma.client.upsert({
    where: { phone: clientPhone },
    update: { name: clientName },
    create: { name: clientName, phone: clientPhone },
  });

  const appointment = await prisma.appointment.create({
    data: {
      clientId: client.id,
      serviceId: service.id,
      barberId: barber.id,
      startsAt,
      endsAt,
      priceCentsAtBooking: service.priceCents,
      notes,
    },
  });

  return { appointment, service, client, barber };
}
