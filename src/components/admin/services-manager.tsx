"use client";

import { useState } from "react";
import { formatCents } from "@/lib/money";

type Service = {
  id: string;
  name: string;
  priceCents: number;
  durationMinutes: number;
  active: boolean;
};

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  async function updateService(id: string, data: Partial<Service>) {
    const res = await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Falha ao atualizar serviço.");
    const json = await res.json();
    setServices((prev) => prev.map((s) => (s.id === id ? json.service : s)));
  }

  async function toggleActive(service: Service) {
    try {
      await updateService(service.id, { active: !service.active });
    } catch {
      alert("Não foi possível atualizar o serviço.");
    }
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {services.map((service) =>
          editingId === service.id ? (
            <EditServiceForm
              key={service.id}
              service={service}
              onCancel={() => setEditingId(null)}
              onSave={async (data) => {
                await updateService(service.id, data);
                setEditingId(null);
              }}
            />
          ) : (
            <li
              key={service.id}
              className="steel-border flex flex-col gap-3 rounded-sm bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-heading font-semibold uppercase tracking-wide">
                  {service.name}
                </p>
                <p className="text-sm text-muted">
                  {formatCents(service.priceCents)} · {service.durationMinutes} min
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${service.active ? "text-success" : "text-muted"}`}
                >
                  {service.active ? "Ativo" : "Inativo"}
                </span>
                <button
                  onClick={() => setEditingId(service.id)}
                  className="min-h-[40px] rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(service)}
                  className="min-h-[40px] rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold"
                >
                  {service.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </li>
          )
        )}
      </ul>

      {showNewForm ? (
        <NewServiceForm
          onCancel={() => setShowNewForm(false)}
          onCreated={(service) => {
            setServices((prev) => [...prev, service]);
            setShowNewForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowNewForm(true)}
          className="min-h-[44px] w-full rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft sm:w-auto"
        >
          + Novo serviço
        </button>
      )}
    </div>
  );
}

function EditServiceForm({
  service,
  onSave,
  onCancel,
}: {
  service: Service;
  onSave: (data: Partial<Service>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(service.name);
  const [price, setPrice] = useState((service.priceCents / 100).toString());
  const [duration, setDuration] = useState(service.durationMinutes.toString());
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name,
        priceCents: Math.round(Number(price.replace(",", ".")) * 100),
        durationMinutes: Number(duration),
      });
    } catch {
      alert("Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-3 rounded-sm bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          placeholder="Preço (R$)"
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          inputMode="numeric"
          placeholder="Duração (min)"
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft disabled:opacity-60"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function NewServiceForm({
  onCreated,
  onCancel,
}: {
  onCreated: (service: Service) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          priceCents: Math.round(Number(price.replace(",", ".")) * 100),
          durationMinutes: Number(duration),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível criar o serviço.");
      onCreated(data.service);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o serviço.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-3 rounded-sm bg-surface p-4">
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          required
          placeholder="Nome do serviço"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          required
          placeholder="Preço (R$)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="decimal"
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          required
          placeholder="Duração (min)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          inputMode="numeric"
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft disabled:opacity-60"
        >
          Criar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
