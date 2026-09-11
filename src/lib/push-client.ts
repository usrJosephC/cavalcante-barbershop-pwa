"use client";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("Falha ao registrar o service worker:", error);
    return null;
  }
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window
  );
}

type SubscribeTarget =
  | { kind: "client"; phone: string }
  | { kind: "admin" };

export async function subscribeToPush(target: SubscribeTarget): Promise<"subscribed" | "denied" | "unsupported"> {
  if (!isPushSupported()) return "unsupported";

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";

  const registration = (await registerServiceWorker()) ?? (await navigator.serviceWorker.ready);

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const endpointUrl = target.kind === "admin" ? "/api/admin/push/subscribe" : "/api/push/subscribe";
  const body =
    target.kind === "admin"
      ? { subscription: subscription.toJSON() }
      : { role: "CLIENT", clientPhone: target.phone, subscription: subscription.toJSON() };

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Não foi possível concluir a inscrição para notificações.");
  }

  return "subscribed";
}
