"use client";

import { useState } from "react";

type Client = {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  totalAppointments: number;
  lastVisit: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export function ClientsExplorer({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clients?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setClients(data.clients);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou telefone"
          className="min-h-[44px] flex-1 rounded-sm border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-[44px] rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black hover:bg-gold-soft disabled:opacity-60"
        >
          Buscar
        </button>
      </form>

      <div className="steel-border overflow-x-auto rounded-sm">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted">
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Atendimentos</th>
              <th className="p-3">Última visita</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-t border-border">
                <td className="p-3">{client.name}</td>
                <td className="p-3 text-muted">{client.phone}</td>
                <td className="p-3">{client.totalAppointments}</td>
                <td className="p-3 text-muted">{formatDate(client.lastVisit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="p-6 text-center text-sm text-muted">Nenhum cliente encontrado.</p>
        )}
      </div>
    </div>
  );
}
