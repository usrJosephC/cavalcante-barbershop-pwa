import { BUSINESS_HOURS_LABEL } from "@/lib/business-hours";

export function SiteFooter() {
  return (
    <footer className="steel-border border-x-0 border-b-0 mt-auto bg-surface/60">
      <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted sm:px-5">
        <p className="font-heading text-gold tracking-wide uppercase">Cavalcante BarberShop</p>
        <ul className="mt-3 space-y-1">
          {BUSINESS_HOURS_LABEL.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs">© {new Date().getFullYear()} Cavalcante BarberShop.</p>
      </div>
    </footer>
  );
}
