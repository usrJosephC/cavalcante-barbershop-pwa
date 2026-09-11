import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Runtime usa a conexão via pooler (DATABASE_URL). O CLI do Prisma (migrations/studio)
// usa a conexão direta configurada em prisma.config.ts.
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
