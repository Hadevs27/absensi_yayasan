import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { getClassById } from "@/features/classes/services/class-service";
import { requireAdmin } from "@/lib/auth";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const classItem = await getClassById(getDb(), id);

  if (!classItem) {
    notFound();
  }

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-700">Detail kelas</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">{classItem.name}</h1>
          </div>
          <Link href={`/classes/${classItem.id}/edit`} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Edit</Link>
        </div>
        <section className="grid gap-3 rounded-lg border border-stone-200 bg-white p-5 sm:grid-cols-2">
          <Info label="Jenjang" value={classItem.level} />
          <Info label="Tahun ajaran" value={classItem.academicYear} />
          <Info label="Kapasitas" value={String(classItem.capacity)} />
        </section>
      </section>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-semibold uppercase text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-900">{value}</p>
    </div>
  );
}
