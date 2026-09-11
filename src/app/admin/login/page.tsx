import type { Metadata } from "next";

export const metadata: Metadata = { title: "Login do painel" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-heading text-xs tracking-[0.35em] text-muted uppercase">
            Cavalcante BarberShop
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold text-gradient-gold uppercase tracking-wide">
            Painel do Barbeiro
          </h1>
        </div>

        <form
          method="POST"
          action="/api/admin/login"
          className="steel-border rivet-corners space-y-4 rounded-sm bg-surface p-6"
        >
          {hasError && (
            <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              E-mail ou senha inválidos.
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs uppercase tracking-wider text-muted">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              placeholder="admin@cavalcantebarbershop.com.br"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs uppercase tracking-wider text-muted">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full min-h-[44px] rounded-sm border border-border bg-surface-elevated px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="min-h-[44px] w-full rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-black transition-colors hover:bg-gold-soft"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Acesso restrito ao barbeiro responsável pela Cavalcante BarberShop.
        </p>
      </div>
    </main>
  );
}
