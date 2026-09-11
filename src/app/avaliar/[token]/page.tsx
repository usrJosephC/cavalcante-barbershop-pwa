import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeedbackForm } from "@/components/booking/feedback-form";

export const metadata: Metadata = { title: "Avaliar atendimento" };
export const dynamic = "force-dynamic";

export default async function AvaliarPage({ params }: PageProps<"/avaliar/[token]">) {
  const { token } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: { service: true, feedback: true },
  });

  if (!appointment) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8 sm:px-5 sm:py-10">
        <h1 className="font-heading text-center text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
          Avaliar atendimento
        </h1>
        <p className="mt-2 text-center text-sm text-muted">{appointment.service.name}</p>

        <div className="mt-8">
          {appointment.feedback ? (
            <div className="steel-border rounded-sm bg-surface p-6 text-center text-sm text-muted">
              Você já avaliou este atendimento. Obrigado!
            </div>
          ) : appointment.status !== "COMPLETED" ? (
            <div className="steel-border rounded-sm bg-surface p-6 text-center text-sm text-muted">
              Este atendimento ainda não foi concluído. A avaliação fica disponível depois do
              atendimento.
            </div>
          ) : (
            <FeedbackForm cancelToken={token} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
