import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { getStudentById } from "@/features/students/services/student-service";
import { requireAdmin } from "@/lib/auth";
import { formatDateId } from "@/lib/date";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const student = await getStudentById(getDb(), id);

  if (!student) {
    notFound();
  }

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-700">Detail siswa</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">{student.name}</h1>
          </div>
          <Link href={`/students/${student.id}/edit`} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Edit</Link>
        </div>
        <section className="grid gap-3 rounded-lg border border-stone-200 bg-white p-5 sm:grid-cols-2">
          <Info label="NIS" value={student.nis} />
          <Info label="Jenis kelamin" value={student.gender === "male" ? "Laki-laki" : student.gender === "female" ? "Perempuan" : "-"} />
          <Info label="Tanggal lahir" value={student.birthDate ? formatDateId(student.birthDate) : "-"} />
          <Info label="Orang tua" value={student.parentName ?? student.guardianName ?? "-"} />
          <Info label="Telepon" value={student.phone ?? "-"} />
          <Info label="Status" value={student.isActive ? "Aktif" : "Nonaktif"} />
          <div className="sm:col-span-2">
            <Info label="Alamat" value={student.address ?? "-"} />
          </div>
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
