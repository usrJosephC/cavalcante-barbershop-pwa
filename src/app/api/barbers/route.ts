import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const barbers = await prisma.barber.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true },
  });
  return NextResponse.json({ barbers });
}
