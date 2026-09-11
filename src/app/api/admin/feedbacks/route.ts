import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, appointment: { include: { service: true } } },
    take: 100,
  });

  const avgRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : null;

  return NextResponse.json({
    avgRating,
    total: feedbacks.length,
    feedbacks: feedbacks.map((f) => ({
      id: f.id,
      rating: f.rating,
      comment: f.comment,
      createdAt: f.createdAt,
      clientName: f.client.name,
      serviceName: f.appointment.service.name,
      appointmentDate: f.appointment.startsAt,
    })),
  });
}
