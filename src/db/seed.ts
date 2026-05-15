import { config } from "dotenv";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { attendanceRecords, users } from "./schema";
import { toIsoDate } from "@/lib/date";

config({ path: ".env.local" });
config();

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  employeeCode: string;
};

const seedUsers: SeedUser[] = [
  {
    name: "Admin Absensi",
    email: "admin@absensi.test",
    password: "admin123",
    role: "admin",
    employeeCode: "ADM-001",
  },
  {
    name: "Budi Santoso",
    email: "budi@absensi.test",
    password: "user123",
    role: "user",
    employeeCode: "USR-001",
  },
  {
    name: "Siti Rahma",
    email: "siti@absensi.test",
    password: "user123",
    role: "user",
    employeeCode: "USR-002",
  },
  {
    name: "Dewi Lestari",
    email: "dewi@absensi.test",
    password: "user123",
    role: "user",
    employeeCode: "USR-003",
  },
];

function pastWorkDates(total: number) {
  const dates: string[] = [];
  const cursor = new Date();

  while (dates.length < total) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const day = cursor.getUTCDay();

    if (day !== 0 && day !== 6) {
      dates.push(toIsoDate(cursor));
    }
  }

  return dates.reverse();
}

function atJakartaTime(date: string, hour: number, minute: number) {
  const utcHour = hour - 7;
  return new Date(`${date}T${String(utcHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00.000Z`);
}

async function main() {
  const db = getDb();
  const passwordByEmail = new Map<string, string>();

  for (const seedUser of seedUsers) {
    passwordByEmail.set(seedUser.email, await hash(seedUser.password, 10));
  }

  for (const seedUser of seedUsers) {
    await db
      .insert(users)
      .values({
        name: seedUser.name,
        email: seedUser.email,
        passwordHash: passwordByEmail.get(seedUser.email)!,
        role: seedUser.role,
        employeeCode: seedUser.employeeCode,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: seedUser.name,
          passwordHash: passwordByEmail.get(seedUser.email)!,
          role: seedUser.role,
          employeeCode: seedUser.employeeCode,
          updatedAt: new Date(),
        },
      });
  }

  const savedUsers = await db.select().from(users);
  const userByEmail = new Map(savedUsers.map((user) => [user.email, user]));
  const dates = pastWorkDates(18);

  const patterns = [
    {
      email: "budi@absensi.test",
      statuses: [
        "present",
        "present",
        "late",
        "present",
        "permission",
        "present",
        "late",
        "present",
        "present",
        "sick",
        "present",
        "late",
        "present",
        "present",
        "present",
        "late",
        "present",
        "present",
      ],
    },
    {
      email: "siti@absensi.test",
      statuses: [
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
        "present",
      ],
    },
    {
      email: "dewi@absensi.test",
      statuses: [
        "absent",
        "late",
        "present",
        "absent",
        "sick",
        "late",
        "present",
        "absent",
        "permission",
        "late",
        "present",
        "absent",
        "leave",
        "late",
        "present",
        "absent",
        "late",
        "permission",
      ],
    },
  ] as const;

  for (const pattern of patterns) {
    const user = userByEmail.get(pattern.email);

    if (!user) {
      continue;
    }

    for (const [index, status] of pattern.statuses.entries()) {
      const workDate = dates[index];
      const hasAttendanceTime = status !== "absent" && status !== "permission" && status !== "sick";
      const isLate = status === "late";

      await db
        .insert(attendanceRecords)
        .values({
          userId: user.id,
          workDate,
          status,
          checkInAt: hasAttendanceTime ? atJakartaTime(workDate, isLate ? 8 : 7, isLate ? 42 : 55) : null,
          checkOutAt: hasAttendanceTime ? atJakartaTime(workDate, 17, 2) : null,
          notes: status === "permission" ? "Izin kegiatan keluarga" : null,
        })
        .onConflictDoNothing();
    }
  }

  const admin = await db.query.users.findFirst({
    where: eq(users.email, "admin@absensi.test"),
  });

  const budi = await db.query.users.findFirst({
    where: eq(users.email, "budi@absensi.test"),
  });

  console.log("Seed selesai.");
  console.log(`Admin: ${admin?.email} / admin123`);
  console.log(`User: ${budi?.email} / user123`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
