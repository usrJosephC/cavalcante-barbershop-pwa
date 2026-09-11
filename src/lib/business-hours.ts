import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addMinutes, format, isBefore, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";

export const TIMEZONE = "America/Sao_Paulo";

/** Intervalo entre horários disponíveis oferecidos ao cliente. */
export const SLOT_STEP_MINUTES = 15;

/** Antecedência mínima para um agendamento no mesmo dia. */
export const MIN_BOOKING_NOTICE_MINUTES = 30;

type DayHours = { open: string; close: string } | null;

/** Chave: dia da semana (0 = domingo ... 6 = sábado), igual ao Date#getDay(). */
export const BUSINESS_HOURS: Record<number, DayHours> = {
  0: { open: "09:00", close: "14:00" }, // Domingo
  1: null, // Segunda-feira - fechado
  2: { open: "08:30", close: "19:00" }, // Terça
  3: { open: "08:30", close: "19:00" }, // Quarta
  4: { open: "08:30", close: "19:00" }, // Quinta
  5: { open: "08:30", close: "19:00" }, // Sexta
  6: { open: "08:30", close: "19:00" }, // Sábado
};

export const BUSINESS_HOURS_LABEL = [
  "Terça a Sábado: 08:30 - 19:00",
  "Domingo: 09:00 - 14:00",
  "Segunda-feira: fechado",
];

function parseHourMinute(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Retorna o horário de funcionamento (em minutos desde 00:00, no fuso da barbearia)
 * para a data informada, ou `null` se a barbearia estiver fechada nesse dia.
 */
export function getBusinessHoursForDate(dateInTz: Date): DayHours {
  const weekday = dateInTz.getDay();
  return BUSINESS_HOURS[weekday] ?? null;
}

export type ExistingAppointment = { startsAt: Date; endsAt: Date };

/**
 * Calcula os horários disponíveis (em UTC) para uma data (YYYY-MM-DD, no fuso da barbearia)
 * e um serviço com determinada duração, considerando agendamentos já existentes.
 */
export function getAvailableSlots({
  dateStr,
  durationMinutes,
  existingAppointments,
  now = new Date(),
}: {
  dateStr: string; // "2026-09-10"
  durationMinutes: number;
  existingAppointments: ExistingAppointment[];
  now?: Date;
}): Date[] {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Meio-dia local apenas para descobrir o dia da semana com segurança (evita problemas de DST na virada 00:00).
  const noonLocal = new Date(year, month - 1, day, 12, 0, 0);
  const hours = getBusinessHoursForDate(noonLocal);
  if (!hours) return [];

  const open = parseHourMinute(hours.open);
  const close = parseHourMinute(hours.close);

  const buildLocalDate = (h: number, m: number) =>
    setMilliseconds(setSeconds(setMinutes(setHours(new Date(year, month - 1, day), h), m), 0), 0);

  const dayOpenLocal = buildLocalDate(open.hours, open.minutes);
  const dayCloseLocal = buildLocalDate(close.hours, close.minutes);

  const lastPossibleStartLocal = addMinutes(dayCloseLocal, -durationMinutes);
  const earliestAllowed = addMinutes(now, MIN_BOOKING_NOTICE_MINUTES);

  const slots: Date[] = [];
  let cursorLocal = dayOpenLocal;

  while (!isBefore(lastPossibleStartLocal, cursorLocal)) {
    const slotStartUtc = fromZonedTime(cursorLocal, TIMEZONE);
    const slotEndUtc = addMinutes(slotStartUtc, durationMinutes);

    const isPast = isBefore(slotStartUtc, earliestAllowed);
    const hasConflict = existingAppointments.some(
      (appt) => slotStartUtc < appt.endsAt && slotEndUtc > appt.startsAt
    );

    if (!isPast && !hasConflict) {
      slots.push(slotStartUtc);
    }

    cursorLocal = addMinutes(cursorLocal, SLOT_STEP_MINUTES);
  }

  return slots;
}

export function isBusinessOpenOn(dateStr: string): boolean {
  const [year, month, day] = dateStr.split("-").map(Number);
  const noonLocal = new Date(year, month - 1, day, 12, 0, 0);
  return getBusinessHoursForDate(noonLocal) !== null;
}

export function formatTimeInBusinessTz(date: Date): string {
  return format(toZonedTime(date, TIMEZONE), "HH:mm");
}

export function formatDateTimeInBusinessTz(date: Date): string {
  return format(toZonedTime(date, TIMEZONE), "dd/MM/yyyy 'às' HH:mm");
}

export function shiftDateKey(dateStr: string, deltaDays: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day + deltaDays, 12);
  return format(date, "yyyy-MM-dd");
}

export function formatDateInBusinessTz(date: Date): string {
  return format(toZonedTime(date, TIMEZONE), "dd/MM/yyyy");
}
