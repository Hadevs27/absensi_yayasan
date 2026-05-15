import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string; next?: string }
    | null;

  const email = body?.email?.toLowerCase().trim();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ message: "Email dan password wajib diisi." }, { status: 400 });
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return NextResponse.json({ message: "Email atau password tidak sesuai." }, { status: 401 });
  }

  const passwordValid = await compare(password, user.passwordHash);

  if (!passwordValid) {
    return NextResponse.json({ message: "Email atau password tidak sesuai." }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const response = NextResponse.json({
    redirectTo: body?.next && body.next.startsWith("/") ? body.next : "/dashboard",
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
