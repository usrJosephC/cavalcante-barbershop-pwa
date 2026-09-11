import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { serviceInputSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = serviceInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const service = await prisma.service.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ service });
}
