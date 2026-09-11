import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolveMigrationUrl } from "./prisma/db-url";

// O CLI do Prisma (migrate/db push/studio) usa a conexão DIRETA (porta 5432 no Supabase,
// ou a única URL exposta por provedores como Vercel Postgres/Prisma Postgres),
// diferente do PrismaClient em runtime, que usa a conexão via pooler (DATABASE_URL).
// Veja src/lib/prisma.ts para a configuração do client em runtime e prisma/db-url.ts
// para a lógica de fallback entre DIRECT_URL e DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: resolveMigrationUrl(),
  },
});
