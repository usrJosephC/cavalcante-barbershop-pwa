"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function BarberFilter({ barbers }: { barbers: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("barberId") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("barberId", e.target.value);
    } else {
      params.delete("barberId");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="min-h-[40px] rounded-sm border border-border bg-surface-elevated px-3 py-1.5 text-xs uppercase tracking-wide text-foreground outline-none focus:border-gold"
    >
      <option value="">Todos os barbeiros</option>
      {barbers.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
