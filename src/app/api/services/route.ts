import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { priceCents: "asc" },
  });
  return NextResponse.json({ services });
}
