import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("Chaves VAPID não configuradas (Web Push desabilitado).");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/**
 * Envia uma notificação para uma subscription específica. Remove a subscription
 * automaticamente do banco se o navegador/endpoint responder que ela expirou (404/410).
 */
async function sendToSubscription(
  subscription: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  try {
    ensureConfigured();
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
    } else {
      console.error("Falha ao enviar push notification:", error);
    }
  }
}

export async function notifyClient(clientId: string, payload: PushPayload) {
  if (!isPushConfigured()) return;
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { clientId, role: "CLIENT" },
  });
  await Promise.all(subscriptions.map((sub) => sendToSubscription(sub, payload)));
}

export async function notifyAdmins(payload: PushPayload) {
  if (!isPushConfigured()) return;
  const subscriptions = await prisma.pushSubscription.findMany({ where: { role: "ADMIN" } });
  await Promise.all(subscriptions.map((sub) => sendToSubscription(sub, payload)));
}
