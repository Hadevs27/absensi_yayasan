# Absensi K-Means

Sistem Informasi Absensi Berbasis Web dengan Integrasi Algoritma K-Means.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Drizzle ORM
- PostgreSQL Neon
- `@neondatabase/serverless`
- Target deploy: Vercel

## Environment

Isi `.env.local` dengan connection string dari Neon:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-your-project-pooler.REGION.aws.neon.tech/absensi_kmeans?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@ep-your-project.REGION.aws.neon.tech/absensi_kmeans?sslmode=require"
NEXT_PUBLIC_APP_NAME="Absensi K-Means"
AUTH_SECRET="generate-a-long-random-secret"
```

`DATABASE_URL` memakai host `-pooler` untuk runtime Next.js di localhost dan Vercel.
`DATABASE_URL_UNPOOLED` opsional tetapi direkomendasikan untuk `drizzle-kit push`.

## Setup Neon

1. Buka Neon Console.
2. Buat project baru, misalnya `absensi-kmeans`.
3. Buat atau pilih database `absensi_kmeans`.
4. Di modal Connect, salin connection string pooled untuk `DATABASE_URL`.
5. Salin connection string direct/non-pooled untuk `DATABASE_URL_UNPOOLED`.
6. Masukkan variable yang sama di Vercel Project Settings -> Environment Variables.

## Commands

```bash
npm install
npm run db:push
npm run db:seed
npm run build
npm run dev
```

Di Windows PowerShell yang memblokir `npm.ps1`, pakai:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

## Seed Account

- `admin@absensi.test` / `admin123`
- `budi@absensi.test` / `user123`

## Routes

- `/login`
- `/dashboard`
- `/attendance`
- `/reports` admin only
- `/clusters` admin only

