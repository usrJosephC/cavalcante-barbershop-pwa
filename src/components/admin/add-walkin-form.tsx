"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";
import { formatCents } from "@/lib/money";
import { TIMEZONE } from "@/lib/business-hours";

type Service = { id: string; name: string; priceCents: number; durationMinutes: number };
type Barber = { id: string; name: string };

export function AddWalkInForm({
  services,
  barbers,
  date,
}: {
  services: Service[];
  barbers: Barber[];
  date: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [barberId, setBarberId] = useState(barbers[0]?.id ?? "");
  const [time, setTime] = useState("09:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name,
          clientPhone: phone,
          serviceId,
          barberId,
          startsAt: buildStartsAtIso(date, time),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível criar o agendamento.");
      setOpen(false);
      setName("");
      setPhone("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="min-h-[44px] w-full rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft sm:w-auto"
      >
        + Encaixe / walk-in
      </button>
    );
  }

  if (barbers.length === 0) {
    return (
      <p className="steel-border rounded-sm bg-surface p-4 text-sm text-muted">
        Cadastre ao menos um barbeiro em &quot;Barbeiros&quot; para criar encaixes.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-3 rounded-sm bg-surface p-4">
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Nome do cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          required
          placeholder="Telefone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <select
          value={barberId}
          onChange={(e) => setBarberId(e.target.value)}
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        >
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {formatCents(s.priceCents)}
            </option>
          ))}
        </select>
        <input
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="min-h-[44px] flex-1 rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft disabled:opacity-60 sm:flex-none"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-[44px] flex-1 rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted sm:flex-none"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function buildStartsAtIso(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes);
  return fromZonedTime(localDate, TIMEZONE).toISOString();
}
