"use client";

import { useState } from "react";
import clsx from "clsx";
import { formatCents } from "@/lib/money";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/status-labels";

export type AdminAppointment = {
  id: string;
  startsAt: string;
  status: string;
  priceCents: number;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  barberName: string;
};

const NEXT_ACTIONS: Record<string, { label: string; status: string; variant: "primary" | "danger" }[]> = {
  SCHEDULED: [
    { label: "Confirmar", status: "CONFIRMED", variant: "primary" },
    { label: "Cancelar", status: "CANCELED", variant: "danger" },
  ],
  CONFIRMED: [
    { label: "Concluir", status: "COMPLETED", variant: "primary" },
    { label: "Não compareceu", status: "NO_SHOW", variant: "danger" },
    { label: "Cancelar", status: "CANCELED", variant: "danger" },
  ],
};

export function AppointmentRow({
  appointment,
  onUpdated,
}: {
  appointment: AdminAppointment;
  onUpdated: (id: string, status: string) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const actions = NEXT_ACTIONS[appointment.status] ?? [];

  async function handleAction(newStatus: string) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      onUpdated(appointment.id, newStatus);
    } catch {
      alert("Não foi possível atualizar o status.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <li className="steel-border flex flex-col gap-3 rounded-sm bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold">
          {new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
          }).format(new Date(appointment.startsAt))}{" "}
          <span className="font-heading uppercase tracking-wide">{appointment.serviceName}</span>
        </p>
        <p className="text-sm text-muted">
          {appointment.clientName} · {appointment.clientPhone}
        </p>
        <p className="text-sm text-muted">Barbeiro: {appointment.barberName}</p>
        <p className="text-sm text-gold">{formatCents(appointment.priceCents)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={clsx(
            "text-xs font-semibold uppercase tracking-wide",
            STATUS_COLORS[appointment.status]
          )}
        >
          {STATUS_LABELS[appointment.status]}
        </span>
        {actions.map((action) => (
          <button
            key={action.status}
            onClick={() => handleAction(action.status)}
            disabled={loading !== null}
            className={clsx(
              "min-h-[38px] rounded-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide disabled:opacity-50",
              action.variant === "primary"
                ? "bg-gold text-black hover:bg-gold-soft"
                : "border border-danger/50 text-danger hover:bg-danger/10"
            )}
          >
            {loading === action.status ? "..." : action.label}
          </button>
        ))}
      </div>
    </li>
  );
}
