import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

const dbPushUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!dbPushUrl) {
  throw new Error("DATABASE_URL atau DATABASE_URL_UNPOOLED belum diatur.");
}

if (dbPushUrl.includes("USER:PASSWORD") || dbPushUrl.includes("ep-your-project")) {
  throw new Error("Connection string Neon masih placeholder. Isi .env.local sebelum menjalankan db:push.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbPushUrl,
  },
  strict: true,
  verbose: true,
});
