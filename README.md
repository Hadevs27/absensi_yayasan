# Sistem Informasi Absensi Yayasan dengan Analisis Kedisiplinan K-Means

Aplikasi web untuk mencatat, memonitor, dan menganalisis kedisiplinan siswa pada yayasan/sekolah anak yatim dan dhuafa. Fokus utama sistem adalah absensi harian, rekap kehadiran, dashboard monitoring, dan analisis sederhana menggunakan K-Means.

## Tech Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- PostgreSQL
- Drizzle ORM
- Neon Database
- Recharts
- Zod
- React Hook Form
- next-intl
- next-themes
- Vercel Blob
- Sentry
- Vitest

## Core Scope

- Authentication admin dan user
- Protected route dan role-based middleware
- Master data siswa dan kelas
- Absensi harian siswa
- Rekap absensi
- Dashboard statistik
- Analytics kedisiplinan
- K-Means clustering sederhana
- Export laporan
- User/admin management
- Profile, security, preferences
- Audit log
- Notification center
- Theme persistence
- Multi-language foundation
- Avatar upload via Vercel Blob

Role yang digunakan hanya:

- `admin`
- `user`

## Architecture Overview

```mermaid
flowchart TD
  A["User Browser"] --> B["Next.js App Router"]
  B --> C["Server Components"]
  B --> D["Route Handlers"]
  D --> E["Feature Services"]
  C --> E
  E --> F["Drizzle ORM"]
  F --> G["PostgreSQL Neon"]
  D --> H["Zod Validation"]
  C --> I["Reusable UI Components"]
  I --> J["Recharts Dashboard"]
```

## Folder Structure

```text
src/
  app/                    App Router pages, loading states, and API routes
  components/             Shared layout and UI components
  components/ui/          Empty state, skeleton, toast provider
  core/                   Cross-feature constants, validation, HTTP helpers
  db/                     Drizzle schema, connection, seed
  features/
    analytics/            K-Means dataset and clustering service
    audit/                Activity/audit logging
    classes/              Class data service
    dashboard/            Dashboard query service and chart widgets
    notifications/        User notification center
    profile/              Profile, password, preferences
    students/             Student data service
    users/                User/admin management
  lib/                    Auth/session/date utilities and pure K-Means helper
  messages/               i18n messages
```

## Database Model

```mermaid
erDiagram
  USERS ||--o{ CLASSES : "homeroom_teacher"
  CLASSES ||--o{ STUDENTS : "contains"
  CLASSES ||--o{ ATTENDANCE_SESSIONS : "has"
  ATTENDANCE_SESSIONS ||--o{ ATTENDANCE_DETAILS : "records"
  STUDENTS ||--o{ ATTENDANCE_DETAILS : "has"
  USERS ||--o{ ATTENDANCE_SESSIONS : "creates"
  CLUSTER_RUNS ||--o{ CLUSTERING_RESULTS : "produces"
  STUDENTS ||--o{ CLUSTERING_RESULTS : "classified_as"
  USERS ||--o{ AUDIT_LOGS : "performs"
  USERS ||--o{ NOTIFICATIONS : "receives"

  USERS {
    uuid id PK
    text name
    text email
    text password_hash
    enum role
    boolean is_active
    timestamp last_login_at
  }

  CLASSES {
    uuid id PK
    text name
    text level
    text academic_year
    uuid homeroom_teacher_id FK
    int capacity
  }

  STUDENTS {
    uuid id PK
    text nis
    text name
    enum gender
    date birth_date
    uuid class_id FK
    boolean is_active
  }

  ATTENDANCE_SESSIONS {
    uuid id PK
    uuid class_id FK
    date attendance_date
    uuid created_by FK
    uuid approved_by FK
    timestamp approved_at
  }

  ATTENDANCE_DETAILS {
    uuid id PK
    uuid session_id FK
    uuid student_id FK
    enum status
    text late_reason
    text absence_reason
  }

  AUDIT_LOGS {
    uuid id PK
    uuid user_id FK
    enum action
    text entity
    json old_data
    json new_data
  }

  NOTIFICATIONS {
    uuid id PK
    uuid user_id FK
    text title
    text message
    text type
  }

  CLUSTERING_RESULTS {
    uuid id PK
    uuid run_id FK
    uuid student_id FK
    text cluster_label
    int total_hadir
    int total_terlambat
    int total_alfa
    int total_izin
  }
```

## Use Case Diagram

```mermaid
flowchart LR
  Admin["Admin"] --> Login["Login"]
  User["User / Wali Kelas"] --> Login

  Admin --> ManageStudents["Kelola Siswa"]
  Admin --> ManageClasses["Kelola Kelas"]
  Admin --> ManageUsers["Kelola User/Admin"]
  Admin --> ViewAudit["Lihat Audit Log"]
  Admin --> ViewDashboard["Dashboard Admin"]
  Admin --> RunAnalytics["Jalankan K-Means"]
  Admin --> ExportReports["Export Laporan"]

  User --> InputAttendance["Input Absensi Harian"]
  User --> ViewClassSummary["Lihat Rekap Kelas"]
```

## Activity Diagram Absensi

```mermaid
flowchart TD
  A["User login"] --> B["Pilih kelas"]
  B --> C["Sistem tampilkan daftar siswa"]
  C --> D["User isi status Hadir/Terlambat/Izin/Sakit/Alfa"]
  D --> E["Validasi data absensi"]
  E --> F{"Valid?"}
  F -->|Ya| G["Simpan attendance session dan details"]
  F -->|Tidak| H["Tampilkan error"]
  G --> I["Dashboard dan rekap diperbarui"]
```

## Sequence Diagram K-Means

```mermaid
sequenceDiagram
  actor Admin
  participant UI as Analytics Page
  participant API as K-Means API
  participant Service as Analytics Service
  participant DB as PostgreSQL

  Admin->>UI: Pilih periode dan nilai K
  UI->>API: POST /api/kmeans/run
  API->>Service: getStudentDisciplineDataset
  Service->>DB: Ambil attendance_details
  DB-->>Service: Dataset agregat siswa
  API->>Service: runStudentDisciplineClustering
  Service-->>API: Cluster assignments
  API->>DB: Simpan cluster_runs dan clustering_results
  API-->>UI: Hasil analisis selesai
```

## Analytics Workflow

1. Admin memilih periode analisis.
2. Sistem mengambil data `attendance_details` berdasarkan session absensi.
3. Data diagregasi per siswa menjadi:
   - `total_hadir`
   - `total_terlambat`
   - `total_alfa`
   - `total_izin`
4. Dataset dikirim ke fungsi K-Means.
5. Hasil cluster disimpan ke `clustering_results`.
6. Dashboard menampilkan ringkasan cluster dan tren absensi.

## K-Means Workflow

Cluster dibuat untuk membantu membaca pola kedisiplinan siswa, bukan untuk membuat sistem machine learning kompleks.

Output cluster:

- Disiplin Tinggi
- Disiplin Sedang
- Disiplin Rendah

Faktor yang digunakan:

- Jumlah hadir
- Jumlah terlambat
- Jumlah alfa
- Jumlah izin atau sakit

## Environment

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-your-project-pooler.REGION.aws.neon.tech/absensi_kmeans?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@ep-your-project.REGION.aws.neon.tech/absensi_kmeans?sslmode=require"
NEXT_PUBLIC_APP_NAME="Absensi K-Means"
AUTH_SECRET="generate-a-long-random-secret"
BLOB_READ_WRITE_TOKEN=""
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
```

Gunakan pooled URL untuk runtime Vercel dan localhost. Gunakan direct/non-pooled URL untuk `drizzle-kit push`.

## Local Development

```bash
npm install
npm run db:push
npm run db:seed
npm run type-check
npm test
npm run build
npm run dev
```

Jika PowerShell memblokir `npm.ps1`, jalankan:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

## Seed Account

- `admin@absensi.test` / `admin123`
- `budi@absensi.test` / `user123`

Seed juga membuat contoh kelas, siswa, absensi, dan dataset analytics.

## Main Routes

- `/login`
- `/dashboard`
- `/dashboard/users`
- `/dashboard/audit-logs`
- `/attendance`
- `/students`
- `/classes`
- `/reports`
- `/clusters`
- `/profile`
- `/profile/security`
- `/profile/preferences`
- `/notifications`

## Engineering Improvements

- Feature-based service layer
- Typed API response helper
- Zod validation
- React Hook Form login flow
- Reusable empty state and skeleton
- Toast notification provider
- Student-based analytics service
- Recharts dashboard visualization
- Indexed schema for students, classes, attendance, and clustering
- User/admin CRUD with activation, soft delete, reset password
- Profile management and password change
- Audit log system
- Notification center
- CSV, XLSX, and PDF export
- Sentry integration hooks
- GitHub Actions CI
- Vitest test setup

## Next Incremental Refactor

- Lengkapi penerjemahan semua label UI ke `messages/id.json` dan `messages/en.json`.
- Tambahkan object storage untuk dokumen laporan selain avatar.
- Tambahkan test integration untuk API route dengan database test.
- Tambahkan dashboard recent activity yang membaca audit log.
