"use client";

import { useState } from "react";

type Barber = {
  id: string;
  name: string;
  phone: string | null;
  active: boolean;
};

export function BarbersManager({ initialBarbers }: { initialBarbers: Barber[] }) {
  const [barbers, setBarbers] = useState(initialBarbers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  async function updateBarber(id: string, data: Partial<Barber>) {
    const res = await fetch(`/api/admin/barbers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.error || "Falha ao atualizar barbeiro.");
    }
    const json = await res.json();
    setBarbers((prev) => prev.map((b) => (b.id === id ? json.barber : b)));
  }

  async function toggleActive(barber: Barber) {
    try {
      await updateBarber(barber.id, { active: !barber.active });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível atualizar o barbeiro.");
    }
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {barbers.map((barber) =>
          editingId === barber.id ? (
            <EditBarberForm
              key={barber.id}
              barber={barber}
              onCancel={() => setEditingId(null)}
              onSave={async (data) => {
                await updateBarber(barber.id, data);
                setEditingId(null);
              }}
            />
          ) : (
            <li
              key={barber.id}
              className="steel-border flex flex-col gap-3 rounded-sm bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-heading font-semibold uppercase tracking-wide">{barber.name}</p>
                {barber.phone && <p className="text-sm text-muted">{barber.phone}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${barber.active ? "text-success" : "text-muted"}`}
                >
                  {barber.active ? "Ativo" : "Inativo"}
                </span>
                <button
                  onClick={() => setEditingId(barber.id)}
                  className="min-h-[40px] rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(barber)}
                  className="min-h-[40px] rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-gold hover:text-gold"
                >
                  {barber.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </li>
          )
        )}
        {barbers.length === 0 && (
          <p className="text-sm text-muted">Nenhum barbeiro cadastrado ainda.</p>
        )}
      </ul>

      {showNewForm ? (
        <NewBarberForm
          onCancel={() => setShowNewForm(false)}
          onCreated={(barber) => {
            setBarbers((prev) => [...prev, barber]);
            setShowNewForm(false);
          }}
        />
      ) : (
        <button
          onClick={() => setShowNewForm(true)}
          className="min-h-[44px] rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft"
        >
          + Novo barbeiro
        </button>
      )}
    </div>
  );
}

function EditBarberForm({
  barber,
  onSave,
  onCancel,
}: {
  barber: Barber;
  onSave: (data: Partial<Barber>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(barber.name);
  const [phone, setPhone] = useState(barber.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({ name, phone: phone || null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-3 rounded-sm bg-surface p-4">
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone (opcional)"
          inputMode="tel"
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

function NewBarberForm({
  onCreated,
  onCancel,
}: {
  onCreated: (barber: Barber) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/barbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível criar o barbeiro.");
      onCreated(data.barber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o barbeiro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-3 rounded-sm bg-surface p-4">
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          placeholder="Nome do barbeiro"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <input
          placeholder="Telefone (opcional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
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
