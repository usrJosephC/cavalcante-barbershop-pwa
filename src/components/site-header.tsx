import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="steel-border border-x-0 border-t-0 bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 sm:px-5 sm:py-4">
        <Link
          href="/"
          className="font-heading text-base font-semibold tracking-widest uppercase sm:text-lg"
        >
          <span className="text-gold">Cavalcante</span> BarberShop
        </Link>
        <nav className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-muted sm:gap-5">
          <Link href="/agendar" className="inline-flex min-h-[44px] items-center hover:text-gold">
            Agendar
          </Link>
          <Link
            href="/meus-agendamentos"
            className="inline-flex min-h-[44px] items-center hover:text-gold"
          >
            Meus horários
          </Link>
        </nav>
      </div>
    </header>
  );
}
