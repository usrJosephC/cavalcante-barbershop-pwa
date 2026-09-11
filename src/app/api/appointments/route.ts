import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { bookingSchema } from "@/lib/schemas";
import { BookingError, createAppointment } from "@/lib/appointments";
import { formatDateTimeInBusinessTz } from "@/lib/business-hours";
import { notifyAdmins } from "@/lib/push";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { clientName, clientPhone, serviceId, barberId, startsAt, notes } = parsed.data;

  try {
    const { appointment, service, barber } = await createAppointment({
      clientName,
      clientPhone,
      serviceId,
      barberId,
      startsAt: new Date(startsAt),
      notes,
    });

    try {
      await notifyAdmins({
        title: "Novo agendamento",
        body: `${clientName} agendou ${service.name} com ${barber.name} (${formatCents(service.priceCents)}) para ${formatDateTimeInBusinessTz(
          appointment.startsAt
        )}`,
        url: "/admin/agenda",
        tag: "new-appointment",
      });
    } catch {
      // Notificação é best-effort; falha aqui não deve impedir o agendamento.
    }

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,
          startsAt: appointment.startsAt,
          endsAt: appointment.endsAt,
          cancelToken: appointment.cancelToken,
          serviceName: service.name,
          barberName: barber.name,
          priceCents: appointment.priceCentsAtBooking,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
