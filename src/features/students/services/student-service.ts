import { count, desc, eq, ilike, or } from "drizzle-orm";
import type { AppDb } from "@/db/db";
import { classes, students } from "@/db/schema";
import { DEFAULT_PAGE_SIZE } from "@/core/constants/attendance";

export async function getStudentsPage(
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
    ? or(ilike(students.name, `%${q}%`), ilike(students.nis, `%${q}%`))
    : undefined;

  const [{ total }] = await db.select({ total: count() }).from(students).where(where);
  const rows = await db
    .select({
      id: students.id,
      nis: students.nis,
      name: students.name,
      guardianName: students.guardianName,
      gender: students.gender,
      birthDate: students.birthDate,
      parentName: students.parentName,
      phone: students.phone,
      avatarUrl: students.avatarUrl,
      isActive: students.isActive,
      className: classes.name,
      academicYear: classes.academicYear,
      createdAt: students.createdAt,
    })
    .from(students)
    .leftJoin(classes, eq(students.classId, classes.id))
    .where(where)
    .orderBy(desc(students.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getStudentById(db: AppDb, id: string) {
  return db.query.students.findFirst({
    where: eq(students.id, id),
  });
}

export async function getClassOptions(db: AppDb) {
  return db
    .select({
      id: classes.id,
      name: classes.name,
      academicYear: classes.academicYear,
    })
    .from(classes)
    .orderBy(classes.name);
}
