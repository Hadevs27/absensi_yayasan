import { NextResponse } from "next/server";
import { getDb } from "@/db/db";
import { writeAuditLog } from "@/features/audit/services/audit-service";
import { getCurrentSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const session = await getCurrentSession();

  if (session) {
    await writeAuditLog(getDb(), {
      userId: session.userId,
      action: "logout",
      entity: "auth",
      entityId: session.userId,
    });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
