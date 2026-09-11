import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { AdminPushOptIn } from "@/components/admin/admin-push-opt-in";

const NAV_ITEMS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/barbeiros", label: "Barbeiros" },
  { href: "/admin/servicos", label: "Serviços" },
  { href: "/admin/feedbacks", label: "Feedbacks" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getAdminSession();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="steel-border border-x-0 border-t-0 bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
          <Link
            href="/admin"
            className="font-heading text-sm font-semibold tracking-widest uppercase"
          >
            <span className="text-gold">Cavalcante</span> BarberShop{" "}
            <span className="hidden text-muted sm:inline">/ admin</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {session && <span className="hidden text-xs text-muted md:inline">{session.name}</span>}
            <AdminPushOptIn />
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="min-h-[40px] rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted hover:border-gold hover:text-gold"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2 text-xs font-medium uppercase tracking-wider sm:px-5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[40px] shrink-0 items-center rounded-sm px-3 py-1.5 text-muted hover:bg-surface-elevated hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-5 sm:py-8">{children}</main>
    </div>
  );
}
