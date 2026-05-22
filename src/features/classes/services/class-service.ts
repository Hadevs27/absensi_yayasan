import { count, desc, eq, ilike, or } from "drizzle-orm";
import type { AppDb } from "@/db/db";
import { classes, students, users } from "@/db/schema";
import { DEFAULT_PAGE_SIZE } from "@/core/constants/attendance";

export async function getClassesPage(
  db: AppDb,
  {
    q,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  }: {
    q?: string;
    page?: number;
    pageSize?: number;
  },
) {
  const where = q
    ? or(ilike(classes.name, `%${q}%`), ilike(classes.academicYear, `%${q}%`))
    : undefined;

  const [{ total }] = await db.select({ total: count() }).from(classes).where(where);
  const rows = await db
    .select({
      id: classes.id,
      name: classes.name,
      level: classes.level,
      academicYear: classes.academicYear,
      capacity: classes.capacity,
      createdAt: classes.createdAt,
    })
    .from(classes)
    .where(where)
    .orderBy(desc(classes.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const studentRows = await db
    .select({
      classId: students.classId,
    })
    .from(students);

  const studentCountByClass = new Map<string, number>();

  for (const student of studentRows) {
    if (student.classId) {
      studentCountByClass.set(student.classId, (studentCountByClass.get(student.classId) ?? 0) + 1);
    }
  }

  return {
    rows: rows.map((row) => ({
      ...row,
      studentCount: studentCountByClass.get(row.id) ?? 0,
    })),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getClassById(db: AppDb, id: string) {
  return db.query.classes.findFirst({
    where: eq(classes.id, id),
  });
}

export async function getTeacherOptions(db: AppDb) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(users)
    .where(eq(users.role, "user"))
    .orderBy(users.name);
}
