import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { appointmentStatusSchema } from "@/lib/schemas";
import { notifyClient } from "@/lib/push";
import { formatDateTimeInBusinessTz } from "@/lib/business-hours";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/appointments/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = appointmentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { service: true, client: true },
  });

  if (parsed.data.status === "CONFIRMED") {
    try {
      await notifyClient(appointment.clientId, {
        title: "Agendamento confirmado",
        body: `Seu horário de ${appointment.service.name} em ${formatDateTimeInBusinessTz(
          appointment.startsAt
        )} foi confirmado pela Cavalcante BarberShop.`,
        tag: `appointment-${appointment.id}`,
      });
    } catch {
      // best-effort
    }
  }

  if (parsed.data.status === "CANCELED") {
    try {
      await notifyClient(appointment.clientId, {
        title: "Agendamento cancelado",
        body: `Seu horário de ${appointment.service.name} em ${formatDateTimeInBusinessTz(
          appointment.startsAt
        )} foi cancelado. Fale com a barbearia para reagendar.`,
        tag: `appointment-${appointment.id}`,
      });
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ appointment });
}
