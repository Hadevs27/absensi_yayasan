import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/db/db";
import { getStudentsPage } from "@/features/students/services/student-service";
import { requireAdmin } from "@/lib/auth";
import { Edit, GraduationCap, Plus, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const page = Math.max(1, Number(params.page ?? 1));
  const data = await getStudentsPage(getDb(), { q, page });

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Master data</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Siswa</h1>
          </div>
          <Link
            href="/students/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Tambah siswa
          </Link>
        </div>

        <form className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau NIS"
              className="h-10 w-full rounded-md border border-stone-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <button className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
            Cari
          </button>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          {data.rows.length === 0 ? (
            <EmptyState icon={GraduationCap} title="Data siswa belum tersedia" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-2 pr-3">NIS</th>
                    <th className="py-2 pr-3">Nama</th>
                    <th className="py-2 pr-3">Kelas</th>
                    <th className="py-2 pr-3">Wali</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.rows.map((student) => (
                    <tr key={student.id}>
                      <td className="py-3 pr-3 font-medium text-stone-800">{student.nis}</td>
                      <td className="py-3 pr-3 text-stone-900">{student.name}</td>
                      <td className="py-3 pr-3 text-stone-600">
                        {student.className ?? "-"} {student.academicYear ? `(${student.academicYear})` : ""}
                      </td>
                      <td className="py-3 pr-3 text-stone-600">{student.guardianName ?? "-"}</td>
                      <td className="py-3 pr-3">
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                          {student.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/students/${student.id}`}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                          >
                            Detail
                          </Link>
                          <Link
                            href={`/students/${student.id}/edit`}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                          <DeleteButton
                            endpoint={`/api/students/${student.id}`}
                            confirmMessage={`Hapus siswa ${student.name}?`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex items-center justify-between text-sm text-stone-600">
          <span>
            Halaman {data.page} dari {data.pageCount}
          </span>
          <div className="flex gap-2">
            <Link
              href={`/students?q=${q ?? ""}&page=${Math.max(1, data.page - 1)}`}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50"
            >
              Sebelumnya
            </Link>
            <Link
              href={`/students?q=${q ?? ""}&page=${Math.min(data.pageCount, data.page + 1)}`}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50"
            >
              Berikutnya
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
