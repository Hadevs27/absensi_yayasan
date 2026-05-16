import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { apiFail, apiOk } from "@/core/http/api-response";
import { loginSchema } from "@/core/validation/auth";
import { getDb } from "@/db/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return apiFail("Input login tidak valid.", 400, parsed.error.flatten().fieldErrors);
  }

  const { email, password, next } = parsed.data;
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return apiFail("Email atau password tidak sesuai.", 401);
  }

  const passwordValid = await compare(password, user.passwordHash);

  if (!passwordValid) {
    return apiFail("Email atau password tidak sesuai.", 401);
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const response = apiOk({
    redirectTo: next?.startsWith("/") ? next : "/dashboard",
  });

  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
