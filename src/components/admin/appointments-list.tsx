"use client";

import { useState } from "react";
import { AppointmentRow, type AdminAppointment } from "@/components/admin/appointment-row";

export function AppointmentsList({ initialAppointments }: { initialAppointments: AdminAppointment[] }) {
  const [appointments, setAppointments] = useState(initialAppointments);

  function handleUpdated(id: string, status: string) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  if (appointments.length === 0) {
    return <p className="text-sm text-muted">Nenhum agendamento neste dia.</p>;
  }

  return (
    <ul className="space-y-3">
      {appointments.map((appt) => (
        <AppointmentRow key={appt.id} appointment={appt} onUpdated={handleUpdated} />
      ))}
    </ul>
  );
}
