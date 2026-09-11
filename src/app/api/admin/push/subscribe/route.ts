import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const adminPushSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminPushSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { subscription } = parsed.data;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      role: "ADMIN",
      clientId: null,
      userAgent,
    },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      role: "ADMIN",
      userAgent,
    },
  });

  return NextResponse.json({ ok: true });
}
