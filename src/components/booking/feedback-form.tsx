"use client";

import { useState } from "react";
import clsx from "clsx";

export function FeedbackForm({ cancelToken }: { cancelToken: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Selecione de 1 a 5 estrelas.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelToken, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível enviar sua avaliação.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar sua avaliação.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="steel-border rounded-sm bg-surface p-6 text-center">
        <p className="font-heading text-lg font-semibold uppercase tracking-wide text-gold">
          Obrigado pela avaliação!
        </p>
        <p className="mt-2 text-sm text-muted">
          Seu feedback ajuda a Cavalcante BarberShop a melhorar cada vez mais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="steel-border space-y-5 rounded-sm bg-surface p-6">
      {error && (
        <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="text-center">
        <p className="text-xs uppercase tracking-wider text-muted">Sua nota</p>
        <div className="mt-2 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              className={clsx(
                "min-h-[44px] min-w-[44px] p-1 text-4xl transition-colors",
                (hoverRating || rating) >= n ? "text-gold" : "text-border"
              )}
              aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-muted">
          Comentário (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full min-h-[100px] rounded-sm border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Conte como foi seu atendimento..."
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="min-h-[44px] w-full rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-black hover:bg-gold-soft disabled:opacity-60"
      >
        {submitting ? "Enviando..." : "Enviar avaliação"}
      </button>
    </form>
  );
}
