import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/db/db";
import { getAuditLogsPage } from "@/features/audit/services/audit-log-service";
import { requireAdmin } from "@/lib/auth";
import { formatDateTimeId } from "@/lib/date";
import { FileClock, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const page = Math.max(1, Number(params.page ?? 1));
  const data = await getAuditLogsPage(getDb(), { q, page });

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">Monitoring</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Audit Logs</h1>
        </div>

        <form className="flex gap-3 rounded-lg border border-stone-200 bg-white p-4">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input name="q" defaultValue={q} placeholder="Cari entity atau ID" className="h-10 w-full rounded-md border border-stone-300 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <button className="h-10 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white">Cari</button>
        </form>

        <section className="rounded-lg border border-stone-200 bg-white p-4">
          {data.rows.length === 0 ? (
            <EmptyState icon={FileClock} title="Audit log belum tersedia" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="py-2 pr-3">Waktu</th>
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">Action</th>
                    <th className="py-2 pr-3">Entity</th>
                    <th className="py-2 pr-3">Entity ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-3 text-stone-600">{formatDateTimeId(row.createdAt)}</td>
                      <td className="py-3 pr-3">
                        <p className="font-medium text-stone-900">{row.userName ?? "System"}</p>
                        <p className="text-xs text-stone-500">{row.userEmail ?? "-"}</p>
                      </td>
                      <td className="py-3 pr-3 font-semibold text-emerald-800">{row.action}</td>
                      <td className="py-3 pr-3 text-stone-700">{row.entity}</td>
                      <td className="py-3 pr-3 text-stone-500">{row.entityId ?? "-"}</td>
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
