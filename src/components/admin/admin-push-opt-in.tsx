"use client";

import { useEffect, useState } from "react";
import { isPushSupported, subscribeToPush } from "@/lib/push-client";

export function AdminPushOptIn() {
  const [status, setStatus] = useState<"idle" | "subscribed" | "unsupported">("idle");

  useEffect(() => {
    if (!isPushSupported()) {
      Promise.resolve().then(() => setStatus("unsupported"));
      return;
    }
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => {
        if (sub) setStatus("subscribed");
      })
      .catch(() => {});
  }, []);

  if (status === "unsupported" || status === "subscribed") return null;

  async function handleClick() {
    try {
      const result = await subscribeToPush({ kind: "admin" });
      if (result === "subscribed") setStatus("subscribed");
    } catch {
      // silencioso: barbeiro pode tentar novamente depois
    }
  }

  return (
    <button
      onClick={handleClick}
      className="min-h-[40px] rounded-sm border border-gold/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold hover:bg-gold/10"
    >
      Ativar avisos
    </button>
  );
}
