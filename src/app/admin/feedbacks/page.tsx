import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Feedbacks" };
export const dynamic = "force-dynamic";

export default async function FeedbacksPage() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, appointment: { include: { service: true } } },
    take: 100,
  });

  const avgRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-xl font-semibold uppercase tracking-wide text-gradient-gold">
          Feedbacks
        </h1>
        {avgRating !== null && (
          <p className="text-sm text-muted">
            Média:{" "}
            <span className="text-lg font-semibold text-gold">{avgRating.toFixed(1)}</span> / 5 (
            {feedbacks.length})
          </p>
        )}
      </div>

      {feedbacks.length === 0 && (
        <p className="text-sm text-muted">Nenhuma avaliação recebida ainda.</p>
      )}

      <ul className="space-y-3">
        {feedbacks.map((f) => (
          <li key={f.id} className="steel-border rounded-sm bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading font-semibold uppercase tracking-wide">
                  {f.client.name}
                </p>
                <p className="text-xs text-muted">
                  {f.appointment.service.name} ·{" "}
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "medium",
                    timeZone: "America/Sao_Paulo",
                  }).format(f.appointment.startsAt)}
                </p>
              </div>
              <span className="shrink-0 text-gold">
                {"★".repeat(f.rating)}
                {"☆".repeat(5 - f.rating)}
              </span>
            </div>
            {f.comment && <p className="mt-2 text-sm text-foreground">{f.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
