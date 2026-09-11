import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

/** Aceita formatos comuns de telefone BR e normaliza para apenas dígitos. */
export const phoneSchema = z
  .string()
  .min(10, "Telefone inválido.")
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length >= 10 && value.length <= 11, {
    message: "Informe um telefone válido com DDD.",
  });

export const bookingSchema = z.object({
  clientName: z.string().trim().min(2, "Informe seu nome completo."),
  clientPhone: phoneSchema,
  serviceId: z.string().min(1, "Selecione um serviço."),
  barberId: z.string().min(1, "Selecione um barbeiro."),
  startsAt: z.string().min(1, "Selecione um horário.").datetime({ message: "Horário inválido." }),
  notes: z.string().trim().max(500).optional(),
});

export const cancelAppointmentSchema = z.object({
  cancelToken: z.string().min(1),
});

export const lookupAppointmentsSchema = z.object({
  phone: phoneSchema,
});

export const feedbackSchema = z.object({
  cancelToken: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const serviceInputSchema = z.object({
  name: z.string().trim().min(2, "Nome do serviço obrigatório."),
  priceCents: z.number().int().positive("Preço deve ser maior que zero."),
  durationMinutes: z.number().int().positive("Duração deve ser maior que zero."),
  active: z.boolean().optional(),
});

export const barberInputSchema = z.object({
  name: z.string().trim().min(2, "Nome do barbeiro obrigatório."),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : v)),
  active: z.boolean().optional(),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"]),
});

export const pushSubscribeSchema = z.object({
  role: z.enum(["CLIENT", "ADMIN"]),
  clientPhone: phoneSchema.optional(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
  }),
});
