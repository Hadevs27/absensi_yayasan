import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "absensi_session";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "user";
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET wajib diatur untuk production.");
  }

  return new TextEncoder().encode(secret ?? "dev-only-secret-change-me");
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "admin" && payload.role !== "user")
    ) {
      return null;
    }

    return payload as SessionPayload;
  } catch {
    return null;
  }
}
