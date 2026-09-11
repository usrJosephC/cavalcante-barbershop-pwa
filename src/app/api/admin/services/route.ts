import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceInputSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = serviceInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const service = await prisma.service.create({ data: parsed.data });
  return NextResponse.json({ service }, { status: 201 });
}
