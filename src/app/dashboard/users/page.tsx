import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/db/db";
import { UserRowActions } from "@/features/users/components/user-row-actions";
import { getUsersPage } from "@/features/users/services/user-service";
import { requireAdmin } from "@/lib/auth";
import { formatDateTimeId } from "@/lib/date";
import { Edit, Plus, Search, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: "admin" | "user"; page?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const role = params.role || undefined;
  const page = Math.max(1, Number(params.page ?? 1));
  const data = await getUsersPage(getDb(), { q, role, page });

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Administrasi</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">User & Admin</h1>
          </div>
          <Link href="/dashboard/users/create" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" />
            Tambah user
          </Link>
        </div>

        <form className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 md:grid-cols-[1fr_180px_auto] md:items-end">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-stone-400" />
            <span className="text-sm font-medium text-stone-700">Cari</span>
            <input name="q" defaultValue={q} placeholder="Nama atau email" className="mt-2 h-10 w-full rounded-md border border-stone-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Role</span>
            <select name="role" defaultValue={role ?? ""} className="mt-2 h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100">
              <option value="">Semua</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>
          <button className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">Filter</button>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          {data.rows.length === 0 ? (
            <EmptyState icon={Users} title="User belum tersedia" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-2 pr-3">Nama</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Login terakhir</th>
                    <th className="py-2 pr-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.rows.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 pr-3 font-medium text-stone-900">{user.name}</td>
                      <td className="py-3 pr-3 text-stone-600">{user.email}</td>
                      <td className="py-3 pr-3 text-stone-600">{user.role}</td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${user.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-stone-300 bg-stone-100 text-stone-600"}`}>
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-stone-600">{formatDateTimeId(user.lastLoginAt)}</td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/dashboard/users/${user.id}/edit`} className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                          <UserRowActions id={user.id} isActive={user.isActive} />
                          <DeleteButton endpoint={`/api/users/${user.id}`} confirmMessage={`Hapus user ${user.name}?`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
