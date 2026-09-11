"use client";

import { useState } from "react";
import clsx from "clsx";
import { formatCents } from "@/lib/money";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/status-labels";
import { subscribeToPush } from "@/lib/push-client";

type Appointment = {
  id: string;
  cancelToken: string;
  startsAt: string;
  status: string;
  serviceName: string;
  barberName: string;
  priceCents: number;
  hasFeedback: boolean;
};

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export function MyAppointments() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<"idle" | "asking" | "done" | "error">("idle");
  const [nowMs] = useState(() => Date.now());

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao buscar agendamentos.");
      setAppointments(data.appointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar agendamentos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(appt: Appointment) {
    if (!confirm("Cancelar este agendamento?")) return;
    setCancelingId(appt.id);
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelToken: appt.cancelToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível cancelar.");
      setAppointments(
        (prev) =>
          prev?.map((a) => (a.id === appt.id ? { ...a, status: "CANCELED" } : a)) ?? null
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível cancelar.");
    } finally {
      setCancelingId(null);
    }
  }

  async function handleEnablePush() {
    setPushStatus("asking");
    try {
      const result = await subscribeToPush({ kind: "client", phone });
      setPushStatus(result === "subscribed" ? "done" : "error");
    } catch {
      setPushStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          placeholder="(11) 91234-5678"
          className="min-h-[44px] flex-1 rounded-sm border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-black hover:bg-gold-soft disabled:opacity-60"
        >
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {appointments && appointments.length > 0 && (
        <button
          onClick={handleEnablePush}
          disabled={pushStatus === "asking" || pushStatus === "done"}
          className="min-h-[44px] w-full rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted hover:border-gold hover:text-gold disabled:opacity-60"
        >
          {pushStatus === "done"
            ? "Lembretes ativados neste dispositivo"
            : pushStatus === "asking"
              ? "Ativando..."
              : "Ativar lembretes por notificação"}
        </button>
      )}

      {appointments && appointments.length === 0 && (
        <p className="text-center text-sm text-muted">
          Nenhum agendamento encontrado para esse telefone.
        </p>
      )}

      {appointments && appointments.length > 0 && (
        <ul className="space-y-3">
          {appointments.map((appt) => {
            const isFuture = new Date(appt.startsAt).getTime() > nowMs;
            const canCancel =
              isFuture && appt.status !== "CANCELED" && appt.status !== "COMPLETED";
            const canReview = appt.status === "COMPLETED" && !appt.hasFeedback;

            return (
              <li key={appt.id} className="steel-border rounded-sm bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading font-semibold uppercase tracking-wide">
                      {appt.serviceName}
                    </p>
                    <p className="text-sm text-muted">com {appt.barberName}</p>
                    <p className="text-sm text-muted">{formatDateTime(appt.startsAt)}</p>
                    <p className="text-sm">{formatCents(appt.priceCents)}</p>
                  </div>
                  <span
                    className={clsx(
                      "shrink-0 text-xs font-semibold uppercase tracking-wide",
                      STATUS_COLORS[appt.status]
                    )}
                  >
                    {STATUS_LABELS[appt.status]}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(appt)}
                      disabled={cancelingId === appt.id}
                      className="min-h-[40px] rounded-sm border border-danger/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-danger hover:bg-danger/10 disabled:opacity-60"
                    >
                      {cancelingId === appt.id ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                  {canReview && (
                    <a
                      href={`/avaliar/${appt.cancelToken}`}
                      className="inline-flex min-h-[40px] items-center rounded-sm border border-gold/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold hover:bg-gold/10"
                    >
                      Avaliar atendimento
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
