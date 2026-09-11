/**
 * URL usada pelo Prisma CLI (migrate/seed/studio). Prefere DIRECT_URL (conexão direta,
 * necessária quando DATABASE_URL é um pooler como o do Supabase/pgbouncer) e cai para
 * DATABASE_URL quando só ela existir (ex: Vercel Postgres/Prisma Postgres, que expõem uma
 * única connection string já apropriada tanto para runtime quanto para migrations).
 */
export function resolveMigrationUrl(): string {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Defina DIRECT_URL (ou, na falta dele, DATABASE_URL) no ambiente para rodar migrations/seed."
    );
  }
  return url;
}
