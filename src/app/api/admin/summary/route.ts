import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDailySummary } from "@/lib/summary";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const summary = await getDailySummary(
    request.nextUrl.searchParams.get("date"),
    request.nextUrl.searchParams.get("barberId")
  );

  return NextResponse.json({
    ...summary,
    totalAppointments: summary.appointments.length,
    appointments: summary.appointments.map((a) => ({
      id: a.id,
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      status: a.status,
      priceCents: a.priceCentsAtBooking,
      clientName: a.client.name,
      clientPhone: a.client.phone,
      serviceName: a.service.name,
      barberName: a.barber.name,
    })),
  });
}
