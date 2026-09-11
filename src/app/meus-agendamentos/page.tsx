import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MyAppointments } from "@/components/booking/my-appointments";

export const metadata: Metadata = { title: "Meus horários" };

export default function MeusAgendamentosPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8 sm:px-5 sm:py-10">
        <h1 className="font-heading text-center text-2xl font-semibold uppercase tracking-wide text-gradient-gold">
          Meus horários
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Informe o telefone usado no agendamento para ver ou cancelar seus horários.
        </p>
        <div className="mt-8">
          <MyAppointments />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
