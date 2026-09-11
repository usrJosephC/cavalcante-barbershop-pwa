import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BookingError, createAppointment, dateKeyInBusinessTz } from "@/lib/appointments";
import { TIMEZONE } from "@/lib/business-hours";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  const date = dateParam && DATE_RE.test(dateParam) ? dateParam : dateKeyInBusinessTz(new Date());

  const [year, month, day] = date.split("-").map(Number);
  const dayStart = new Date(year, month - 1, day, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: { startsAt: { gte: dayStart, lte: dayEnd } },
    orderBy: { startsAt: "asc" },
    include: { client: true, service: true, barber: true, feedback: true },
  });

  return NextResponse.json({ date, timezone: TIMEZONE, appointments });
}

const adminBookingSchema = z.object({
  clientName: z.string().trim().min(2),
  clientPhone: z.string().min(10).transform((v) => v.replace(/\D/g, "")),
  serviceId: z.string().min(1),
  barberId: z.string().min(1),
  startsAt: z.string().datetime(),
  notes: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const { appointment } = await createAppointment({
      ...parsed.data,
      startsAt: new Date(parsed.data.startsAt),
      allowPastNotice: true,
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
