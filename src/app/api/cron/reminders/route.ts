import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyClient } from "@/lib/push";
import { formatDateTimeInBusinessTz } from "@/lib/business-hours";

export const dynamic = "force-dynamic";

const REMINDER_WINDOW_HOURS = 24;

/**
 * Chamado pelo Vercel Cron (ver vercel.json) a cada hora. Envia um lembrete via Web Push
 * para agendamentos que começam dentro das próximas 24h e ainda não receberam lembrete.
 * Protegido por CRON_SECRET (header Authorization: Bearer <segredo>).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      reminderSentAt: null,
      startsAt: { gte: now, lte: windowEnd },
    },
    include: { service: true, client: true },
  });

  let sent = 0;
  for (const appointment of appointments) {
    try {
      await notifyClient(appointment.clientId, {
        title: "Lembrete do seu horário",
        body: `${appointment.client.name}, seu ${appointment.service.name} na Cavalcante BarberShop é em ${formatDateTimeInBusinessTz(
          appointment.startsAt
        )}.`,
        tag: `reminder-${appointment.id}`,
      });
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { reminderSentAt: new Date() },
      });
      sent += 1;
    } catch (error) {
      console.error(`Falha ao enviar lembrete para agendamento ${appointment.id}:`, error);
    }
  }

  return NextResponse.json({ checked: appointments.length, sent });
}
