import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: parsed.data.cancelToken },
    include: { feedback: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }

  if (appointment.feedback) {
    return NextResponse.json({ error: "Você já avaliou este atendimento." }, { status: 409 });
  }

  if (appointment.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Só é possível avaliar atendimentos já concluídos." },
      { status: 409 }
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  return NextResponse.json({ feedback }, { status: 201 });
}
