import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL belum diatur. Isi .env.local dengan connection string Neon.");
  }

  if (databaseUrl.includes("ep-your-project-pooler") || databaseUrl.includes("USER:PASSWORD")) {
    throw new Error(
      "DATABASE_URL masih placeholder. Ganti dengan pooled connection string Neon yang valid.",
    );
  }

  return databaseUrl;
}

export function getDb() {
  const sql = neon(getDatabaseUrl());
  return drizzle({ client: sql, schema });
}

export type AppDb = ReturnType<typeof getDb>;
