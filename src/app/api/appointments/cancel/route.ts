import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelAppointmentSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = cancelAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: parsed.data.cancelToken },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }

  if (appointment.status === "CANCELED" || appointment.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Este agendamento não pode mais ser cancelado." },
      { status: 409 }
    );
  }

  if (appointment.startsAt.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "Não é possível cancelar um agendamento que já começou." },
      { status: 409 }
    );
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELED" },
  });

  return NextResponse.json({ ok: true });
}
