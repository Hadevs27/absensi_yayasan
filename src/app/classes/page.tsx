import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DeleteButton } from "@/components/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/db/db";
import { getClassesPage } from "@/features/classes/services/class-service";
import { requireAdmin } from "@/lib/auth";
import { Edit, Plus, School, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const page = Math.max(1, Number(params.page ?? 1));
  const data = await getClassesPage(getDb(), { q, page });

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Master data</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Kelas</h1>
          </div>
          <Link
            href="/classes/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Tambah kelas
          </Link>
        </div>

        <form className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari kelas atau tahun ajaran"
              className="h-10 w-full rounded-md border border-stone-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <button className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
            Cari
          </button>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          {data.rows.length === 0 ? (
            <EmptyState icon={School} title="Data kelas belum tersedia" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-2 pr-3">Kelas</th>
                    <th className="py-2 pr-3">Jenjang</th>
                    <th className="py-2 pr-3">Tahun Ajaran</th>
                    <th className="py-2 pr-3">Jumlah Siswa</th>
                    <th className="py-2 pr-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.rows.map((classItem) => (
                    <tr key={classItem.id}>
                      <td className="py-3 pr-3 font-medium text-stone-900">{classItem.name}</td>
                      <td className="py-3 pr-3 text-stone-600">{classItem.level}</td>
                      <td className="py-3 pr-3 text-stone-600">{classItem.academicYear}</td>
                      <td className="py-3 pr-3 text-stone-600">{classItem.studentCount}</td>
                      <td className="py-3 pr-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/classes/${classItem.id}/edit`}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                          <DeleteButton
                            endpoint={`/api/classes/${classItem.id}`}
                            confirmMessage={`Hapus kelas ${classItem.name}?`}
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
              href={`/classes?q=${q ?? ""}&page=${Math.max(1, data.page - 1)}`}
              className="rounded-md border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50"
            >
              Sebelumnya
            </Link>
            <Link
              href={`/classes?q=${q ?? ""}&page=${Math.min(data.pageCount, data.page + 1)}`}
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
