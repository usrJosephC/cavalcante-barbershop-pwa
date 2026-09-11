import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "sw_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não está configurado no ambiente.");
  }
  return new TextEncoder().encode(secret);
}

export type AdminSessionPayload = {
  sub: string; // admin id
  email: string;
  name: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminSessionToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecretKey());
}

export async function verifyAdminSessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

/**
 * Lê e valida a sessão do admin a partir do cookie da requisição atual.
 * Usar em Server Components/Route Handlers de `/admin` e `/api/admin`.
 * O `proxy` já bloqueia o acesso sem sessão; isto é a segunda camada de defesa
 * e serve para obter os dados da sessão (nome/e-mail) quando necessário.
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
