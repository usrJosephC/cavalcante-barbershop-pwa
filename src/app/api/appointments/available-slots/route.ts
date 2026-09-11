import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, isBusinessOpenOn } from "@/lib/business-hours";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const serviceId = searchParams.get("serviceId");
  const barberId = searchParams.get("barberId");
  const date = searchParams.get("date");

  if (!serviceId || !barberId || !date || !DATE_RE.test(date)) {
    return NextResponse.json(
      { error: "Parâmetros 'serviceId', 'barberId' e 'date' (YYYY-MM-DD) são obrigatórios." },
      { status: 400 }
    );
  }

  if (!isBusinessOpenOn(date)) {
    return NextResponse.json({ slots: [], closed: true });
  }

  const [service, barber] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.barber.findUnique({ where: { id: barberId } }),
  ]);
  if (!service || !service.active) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  }
  if (!barber || !barber.active) {
    return NextResponse.json({ error: "Barbeiro não encontrado." }, { status: 404 });
  }

  const [year, month, day] = date.split("-").map(Number);
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

  const slots = getAvailableSlots({
    dateStr: date,
    durationMinutes: service.durationMinutes,
    existingAppointments,
  });

  return NextResponse.json({ slots: slots.map((slot) => slot.toISOString()), closed: false });
}
