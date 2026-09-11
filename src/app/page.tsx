import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { BUSINESS_HOURS_LABEL } from "@/lib/business-hours";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { priceCents: "asc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-5 sm:py-14">
        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted sm:tracking-[0.35em]">
            Barbearia · Estilo industrial
          </p>
          <h1 className="font-heading mt-3 text-3xl font-bold uppercase tracking-wide sm:text-5xl">
            <span className="text-gradient-gold">Cavalcante</span> BarberShop
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted">
            Corte, navalha e acabamento com precisão. Agende seu horário em menos de um minuto,
            sem precisar criar conta.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/agendar" variant="primary">
              Agendar horário
            </LinkButton>
            <LinkButton href="/meus-agendamentos" variant="secondary">
              Meus horários
            </LinkButton>
          </div>
        </section>

        <section className="mt-14 sm:mt-16">
          <h2 className="font-heading text-center text-xl font-semibold uppercase tracking-wide text-gold">
            Serviços
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="steel-border rounded-sm bg-surface p-5 text-center"
              >
                <p className="font-heading text-base font-semibold uppercase tracking-wide">
                  {service.name}
                </p>
                <p className="mt-2 text-2xl font-bold text-gold">
                  {formatCents(service.priceCents)}
                </p>
                <p className="mt-1 text-xs text-muted">{service.durationMinutes} min</p>
              </div>
            ))}
          </div>
        </section>

        <section className="steel-border mt-14 rounded-sm bg-surface p-5 sm:mt-16 sm:p-6">
          <h2 className="font-heading text-center text-xl font-semibold uppercase tracking-wide text-gold">
            Horário de funcionamento
          </h2>
          <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-center text-sm text-muted">
            {BUSINESS_HOURS_LABEL.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
