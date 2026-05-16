import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { ClassForm } from "@/features/classes/components/class-form";
import { getTeacherOptions } from "@/features/classes/services/class-service";
import { requireAdmin } from "@/lib/auth";

export default async function NewClassPage() {
  const session = await requireAdmin();
  const teachers = await getTeacherOptions(getDb());

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">Master data</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Tambah kelas</h1>
        </div>
        <ClassForm mode="create" teachers={teachers} />
      </section>
    </AppShell>
  );
}
