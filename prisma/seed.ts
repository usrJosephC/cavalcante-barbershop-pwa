import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { resolveMigrationUrl } from "./db-url";

const adapter = new PrismaPg({ connectionString: resolveMigrationUrl() });
const prisma = new PrismaClient({ adapter });

const SERVICES = [
  { name: "Corte Social", priceCents: 2500, durationMinutes: 30 },
  { name: "Degradê Navalhado", priceCents: 3000, durationMinutes: 45 },
  { name: "Nevou Global", priceCents: 8000, durationMinutes: 60 },
];

async function main() {
  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: { priceCents: service.priceCents, durationMinutes: service.durationMinutes },
      create: service,
    });
    console.log(`Serviço garantido: ${service.name}`);
  }

  // Remove qualquer barbeiro criado por engano com nome vazio (ex: SEED_ADMIN_NAME
  // configurado como string vazia em vez de ausente) antes de garantir o barbeiro real.
  await prisma.barber.deleteMany({ where: { name: "" } });

  const defaultBarberName = process.env.SEED_ADMIN_NAME || "Cavalcante BarberShop";
  await prisma.barber.upsert({
    where: { name: defaultBarberName },
    update: {},
    create: { name: defaultBarberName },
  });
  console.log(`Barbeiro garantido: ${defaultBarberName}`);

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || "Cavalcante BarberShop";

  if (!email || !password) {
    console.warn(
      "SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD não definidos - pulando criação do admin."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });
  console.log(`Admin garantido: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
