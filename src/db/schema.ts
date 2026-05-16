import {
  boolean,
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

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    level: text("level").notNull(),
    academicYear: text("academic_year").notNull(),
    homeroomTeacherId: uuid("homeroom_teacher_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    classYearUnique: uniqueIndex("classes_name_year_unique").on(table.name, table.academicYear),
    teacherIdx: index("classes_homeroom_teacher_idx").on(table.homeroomTeacherId),
  }),
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nis: text("nis").notNull(),
    name: text("name").notNull(),
    classId: uuid("class_id").references(() => classes.id, { onDelete: "set null" }),
    guardianName: text("guardian_name"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nisUnique: uniqueIndex("students_nis_unique").on(table.nis),
    classIdx: index("students_class_idx").on(table.classId),
    activeIdx: index("students_active_idx").on(table.isActive),
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

export const attendanceSessions = pgTable(
  "attendance_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    attendanceDate: date("attendance_date").notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    classDateUnique: uniqueIndex("attendance_sessions_class_date_unique").on(
      table.classId,
      table.attendanceDate,
    ),
    attendanceDateIdx: index("attendance_sessions_date_idx").on(table.attendanceDate),
    classIdx: index("attendance_sessions_class_idx").on(table.classId),
  }),
);

export const attendanceDetails = pgTable(
  "attendance_details",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => attendanceSessions.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").notNull().default("present"),
    notes: text("notes"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionStudentUnique: uniqueIndex("attendance_details_session_student_unique").on(
      table.sessionId,
      table.studentId,
    ),
    sessionIdx: index("attendance_details_session_idx").on(table.sessionId),
    studentIdx: index("attendance_details_student_idx").on(table.studentId),
    statusIdx: index("attendance_details_status_idx").on(table.status),
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

export type DisciplineClusterLabel =
  | "Disiplin Tinggi"
  | "Disiplin Sedang"
  | "Disiplin Rendah";

export const clusteringResults = pgTable(
  "clustering_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => clusterRuns.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    clusterIndex: integer("cluster_index").notNull(),
    clusterLabel: text("cluster_label").$type<DisciplineClusterLabel>().notNull(),
    totalHadir: integer("total_hadir").notNull().default(0),
    totalTerlambat: integer("total_terlambat").notNull().default(0),
    totalAlfa: integer("total_alfa").notNull().default(0),
    totalIzin: integer("total_izin").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    runIdx: index("clustering_results_run_idx").on(table.runId),
    studentIdx: index("clustering_results_student_idx").on(table.studentId),
    runStudentUnique: uniqueIndex("clustering_results_run_student_unique").on(
      table.runId,
      table.studentId,
    ),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Class = typeof classes.$inferSelect;
export type Student = typeof students.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type AttendanceDetail = typeof attendanceDetails.$inferSelect;
