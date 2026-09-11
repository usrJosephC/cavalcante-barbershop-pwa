import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { barberInputSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/barbers/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = barberInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const barber = await prisma.barber.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ barber });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "Já existe um barbeiro com esse nome." }, { status: 409 });
    }
    throw error;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "P2002");
}
