import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// O CLI do Prisma (migrate/db push/studio) usa a conexão DIRETA (porta 5432 no Supabase),
// diferente do PrismaClient em runtime, que usa a conexão via pooler (DATABASE_URL, porta 6543).
// Veja src/lib/prisma.ts para a configuração do client em runtime.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
