import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/db/db";
import { getUserNotifications } from "@/features/notifications/services/notification-service";
import { requireSession } from "@/lib/auth";
import { formatDateTimeId } from "@/lib/date";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const session = await requireSession();
  const rows = await getUserNotifications(getDb(), session.userId);

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">System</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Notifikasi</h1>
        </div>
        <section className="rounded-lg border border-stone-200 bg-white p-4">
          {rows.length === 0 ? (
            <EmptyState icon={Bell} title="Belum ada notifikasi" />
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="rounded-md border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-900">{row.title}</p>
                    <span className="text-xs text-stone-500">{formatDateTimeId(row.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">{row.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </AppShell>
  );
}
