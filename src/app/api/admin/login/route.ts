import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyPassword,
} from "@/lib/auth";

async function readCredentials(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json();
  }
  const form = await request.formData();
  return { email: form.get("email"), password: form.get("password") };
}

export async function POST(request: NextRequest) {
  const isFormPost = (request.headers.get("content-type") ?? "").includes(
    "application/x-www-form-urlencoded"
  ) || (request.headers.get("content-type") ?? "").includes("multipart/form-data");

  const body = await readCredentials(request);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    if (isFormPost) {
      return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
    }
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  const passwordOk = admin ? await verifyPassword(parsed.data.password, admin.passwordHash) : false;

  if (!admin || !passwordOk) {
    if (isFormPost) {
      return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
    }
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const token = await createAdminSessionToken({
    sub: admin.id,
    email: admin.email,
    name: admin.name,
  });

  const response = isFormPost
    ? NextResponse.redirect(new URL("/admin", request.url), 303)
    : NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions);
  return response;
}
