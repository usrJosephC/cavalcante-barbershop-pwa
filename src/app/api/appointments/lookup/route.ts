import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { lookupAppointmentsSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = lookupAppointmentsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { phone: parsed.data.phone } });
  if (!client) {
    return NextResponse.json({ appointments: [] });
  }

  const appointments = await prisma.appointment.findMany({
    where: { clientId: client.id },
    orderBy: { startsAt: "desc" },
    take: 20,
    include: { service: true, barber: true, feedback: true },
  });

  return NextResponse.json({
    appointments: appointments.map((appt) => ({
      id: appt.id,
      cancelToken: appt.cancelToken,
      startsAt: appt.startsAt,
      endsAt: appt.endsAt,
      status: appt.status,
      serviceName: appt.service.name,
      barberName: appt.barber.name,
      priceCents: appt.priceCentsAtBooking,
      hasFeedback: Boolean(appt.feedback),
    })),
  });
}
