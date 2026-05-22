import { desc, eq } from "drizzle-orm";
import type { AppDb } from "@/db/db";
import { notifications } from "@/db/schema";

export async function getUserNotifications(db: AppDb, userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}
