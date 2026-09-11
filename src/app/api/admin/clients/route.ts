import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q.replace(/\D/g, "") } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      appointments: {
        orderBy: { startsAt: "desc" },
        take: 1,
        select: { startsAt: true, status: true },
      },
      _count: { select: { appointments: true } },
    },
    take: 200,
  });

  return NextResponse.json({
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      notes: c.notes,
      createdAt: c.createdAt,
      totalAppointments: c._count.appointments,
      lastVisit: c.appointments[0]?.startsAt ?? null,
    })),
  });
}
