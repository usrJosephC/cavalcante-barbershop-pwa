"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { formatCents } from "@/lib/money";
import { subscribeToPush } from "@/lib/push-client";

type Service = {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
};

type Barber = {
  id: string;
  name: string;
};

type Step = "barber" | "service" | "date" | "slot" | "details" | "confirmed";

type ConfirmedAppointment = {
  id: string;
  cancelToken: string;
  startsAt: string;
  serviceName: string;
  barberName: string;
  priceCents: number;
};

function todayIsoDate(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

function maxIsoDate(daysAhead: number): string {
  const date = new Date(Date.now() + daysAhead * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(date);
}

function formatSlotLabel(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

function formatDateLabel(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(
    new Date(year, month - 1, day, 12)
  );
}

const STEP_ORDER: Step[] = ["barber", "service", "date", "slot", "details"];

export function BookingWizard({ services, barbers }: { services: Service[]; barbers: Barber[] }) {
  const [step, setStep] = useState<Step>("barber");
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState(todayIsoDate());
  const [slots, setSlots] = useState<string[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null);
  const [pushStatus, setPushStatus] = useState<"idle" | "asking" | "done" | "error">("idle");

  const minDate = todayIsoDate();
  const maxDate = useMemo(() => maxIsoDate(30), []);

  async function loadSlots(forDate: string, serviceId: string, barberId: string) {
    setSlotsLoading(true);
    setError(null);
    setSelectedSlot(null);
    try {
      const res = await fetch(
        `/api/appointments/available-slots?serviceId=${serviceId}&barberId=${barberId}&date=${forDate}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao buscar horários.");
      setSlots(data.slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar horários.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }

  function handleSelectBarber(barber: Barber) {
    setSelectedBarber(barber);
    setStep("service");
  }

  function handleSelectService(service: Service) {
    setSelectedService(service);
    setStep("date");
  }

  async function handleConfirmDate() {
    if (!selectedService || !selectedBarber) return;
    setStep("slot");
    await loadSlots(date, selectedService.id, selectedBarber.id);
  }

  function handleSelectSlot(slot: string) {
    setSelectedSlot(slot);
    setStep("details");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedSlot || !selectedBarber) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: name,
          clientPhone: phone,
          serviceId: selectedService.id,
          barberId: selectedBarber.id,
          startsAt: selectedSlot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível concluir o agendamento.");
      setConfirmed(data.appointment);
      setStep("confirmed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir o agendamento.");
    } finally {
      setSubmitting(false);
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

  if (barbers.length === 0) {
    return (
      <div className="steel-border rounded-sm bg-surface p-6 text-center text-sm text-muted">
        Nenhum barbeiro disponível para agendamento no momento. Tente novamente mais tarde.
      </div>
    );
  }

  if (step === "confirmed" && confirmed) {
    return (
      <div className="steel-border rivet-corners space-y-4 rounded-sm bg-surface p-5 text-center sm:p-6">
        <p className="font-heading text-lg font-semibold uppercase tracking-wide text-gold">
          Agendamento confirmado!
        </p>
        <p className="text-sm text-muted">
          {confirmed.serviceName} com {confirmed.barberName} · {formatCents(confirmed.priceCents)}
        </p>
        <p className="text-lg font-semibold">
          {new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "America/Sao_Paulo",
          }).format(new Date(confirmed.startsAt))}
        </p>

        <div className="space-y-2 pt-2">
          {pushStatus !== "done" && (
            <button
              onClick={handleEnablePush}
              disabled={pushStatus === "asking"}
              className="min-h-[44px] w-full rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-black transition-colors hover:bg-gold-soft disabled:opacity-60"
            >
              {pushStatus === "asking" ? "Ativando..." : "Ativar lembrete por notificação"}
            </button>
          )}
          {pushStatus === "done" && (
            <p className="text-sm text-success">Lembretes ativados neste dispositivo.</p>
          )}
          {pushStatus === "error" && (
            <p className="text-sm text-danger">
              Não foi possível ativar. Você pode tentar novamente em &quot;Meus horários&quot;.
            </p>
          )}
          <a
            href="/meus-agendamentos"
            className="flex min-h-[44px] w-full items-center justify-center rounded-sm border border-border px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground hover:border-gold hover:text-gold"
          >
            Ver meus horários
          </a>
        </div>

        <p className="text-xs text-muted">
          Guarde este link para cancelar se precisar:{" "}
          <span className="break-all text-gold">/meus-agendamentos</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ol className="flex justify-between text-[11px] uppercase tracking-wider text-muted">
        {STEP_ORDER.map((s, idx) => (
          <li
            key={s}
            className={clsx(
              "flex-1 border-b-2 pb-2 text-center",
              step === s ? "border-gold text-gold" : "border-border"
            )}
          >
            {idx + 1}
          </li>
        ))}
      </ol>

      {error && (
        <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {step === "barber" && (
        <div className="grid gap-3">
          {barbers.map((barber) => (
            <button
              key={barber.id}
              onClick={() => handleSelectBarber(barber)}
              className="steel-border flex min-h-[52px] items-center rounded-sm bg-surface px-4 py-3.5 text-left hover:border-gold"
            >
              <span className="font-heading font-semibold uppercase tracking-wide">
                {barber.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {step === "service" && selectedBarber && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Barbeiro: <span className="text-foreground">{selectedBarber.name}</span>
          </p>
          <div className="grid gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleSelectService(service)}
                className="steel-border flex min-h-[52px] items-center justify-between rounded-sm bg-surface px-4 py-3.5 text-left hover:border-gold"
              >
                <span>
                  <span className="block font-heading font-semibold uppercase tracking-wide">
                    {service.name}
                  </span>
                  <span className="text-xs text-muted">{service.durationMinutes} min</span>
                </span>
                <span className="font-semibold text-gold">{formatCents(service.priceCents)}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep("barber")}
            className="min-h-[40px] w-full text-xs uppercase tracking-wider text-muted hover:text-foreground"
          >
            Voltar
          </button>
        </div>
      )}

      {step === "date" && selectedService && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Serviço: <span className="text-foreground">{selectedService.name}</span>
          </p>
          <input
            type="date"
            value={date}
            min={minDate}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-[44px] w-full rounded-sm border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
          />
          <button
            onClick={handleConfirmDate}
            className="min-h-[44px] w-full rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-black hover:bg-gold-soft"
          >
            Ver horários disponíveis
          </button>
          <button
            onClick={() => setStep("service")}
            className="min-h-[40px] w-full text-xs uppercase tracking-wider text-muted hover:text-foreground"
          >
            Voltar
          </button>
        </div>
      )}

      {step === "slot" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{formatDateLabel(date)}</p>
          {slotsLoading && <p className="text-sm text-muted">Carregando horários...</p>}
          {!slotsLoading && slots && slots.length === 0 && (
            <p className="text-sm text-muted">
              Nenhum horário disponível nesse dia. Tente outra data.
            </p>
          )}
          {!slotsLoading && slots && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleSelectSlot(slot)}
                  className="steel-border min-h-[44px] rounded-sm bg-surface py-2 text-sm hover:border-gold hover:text-gold"
                >
                  {formatSlotLabel(slot)}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setStep("date")}
            className="min-h-[40px] w-full text-xs uppercase tracking-wider text-muted hover:text-foreground"
          >
            Voltar
          </button>
        </div>
      )}

      {step === "details" && selectedService && selectedSlot && selectedBarber && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="steel-border rounded-sm bg-surface p-4 text-sm">
            <p>
              <span className="text-muted">Barbeiro:</span> {selectedBarber.name}
            </p>
            <p>
              <span className="text-muted">Serviço:</span> {selectedService.name}
            </p>
            <p>
              <span className="text-muted">Quando:</span>{" "}
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "America/Sao_Paulo",
              }).format(new Date(selectedSlot))}
            </p>
            <p>
              <span className="text-muted">Valor:</span> {formatCents(selectedService.priceCents)}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted">Nome completo</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px] w-full rounded-sm border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted">
              Telefone (WhatsApp)
            </label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="min-h-[44px] w-full rounded-sm border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:border-gold"
              placeholder="(11) 91234-5678"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] w-full rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-black hover:bg-gold-soft disabled:opacity-60"
          >
            {submitting ? "Confirmando..." : "Confirmar agendamento"}
          </button>
          <button
            type="button"
            onClick={() => setStep("slot")}
            className="min-h-[40px] w-full text-xs uppercase tracking-wider text-muted hover:text-foreground"
          >
            Voltar
          </button>
        </form>
      )}
    </div>
  );
}
