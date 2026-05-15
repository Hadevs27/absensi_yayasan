import {
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "user"]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "late",
  "permission",
  "sick",
  "leave",
  "absent",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("user"),
    employeeCode: text("employee_code").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email),
    employeeCodeUnique: uniqueIndex("users_employee_code_unique").on(table.employeeCode),
  }),
);

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workDate: date("work_date").notNull(),
    status: attendanceStatusEnum("status").notNull().default("present"),
    checkInAt: timestamp("check_in_at", { withTimezone: true }),
    checkOutAt: timestamp("check_out_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userDateUnique: uniqueIndex("attendance_records_user_date_unique").on(
      table.userId,
      table.workDate,
    ),
    workDateIdx: index("attendance_records_work_date_idx").on(table.workDate),
    userIdx: index("attendance_records_user_idx").on(table.userId),
  }),
);

export const clusterRuns = pgTable(
  "cluster_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    k: integer("k").notNull(),
    silhouetteScore: real("silhouette_score"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    createdAtIdx: index("cluster_runs_created_at_idx").on(table.createdAt),
  }),
);

export type ClusterMetrics = {
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  cuti: number;
  alfa: number;
};

export const clusterResults = pgTable(
  "cluster_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => clusterRuns.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clusterIndex: integer("cluster_index").notNull(),
    label: text("label").notNull(),
    metrics: jsonb("metrics").$type<ClusterMetrics>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    runIdx: index("cluster_results_run_idx").on(table.runId),
    runUserUnique: uniqueIndex("cluster_results_run_user_unique").on(table.runId, table.userId),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
