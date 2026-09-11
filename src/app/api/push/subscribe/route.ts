import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushSubscribeSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pushSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { role, clientPhone, subscription } = parsed.data;

  // Este endpoint é público: só aceita inscrições de CLIENTE. Inscrição de ADMIN
  // acontece em /api/admin/push/subscribe, protegido por sessão.
  if (role !== "CLIENT") {
    return NextResponse.json({ error: "Papel inválido para este endpoint." }, { status: 403 });
  }

  if (!clientPhone) {
    return NextResponse.json(
      { error: "Telefone é obrigatório para inscrever lembretes do cliente." },
      { status: 400 }
    );
  }
  const client = await prisma.client.findUnique({ where: { phone: clientPhone } });
  if (!client) {
    return NextResponse.json(
      { error: "Cliente não encontrado. Faça um agendamento primeiro." },
      { status: 404 }
    );
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      role: "CLIENT",
      clientId: client.id,
      userAgent,
    },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      role: "CLIENT",
      clientId: client.id,
      userAgent,
    },
  });

  return NextResponse.json({ ok: true });
}
