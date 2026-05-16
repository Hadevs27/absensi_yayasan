import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { StudentForm } from "@/features/students/components/student-form";
import { getClassOptions } from "@/features/students/services/student-service";
import { requireAdmin } from "@/lib/auth";

export default async function NewStudentPage() {
  const session = await requireAdmin();
  const classes = await getClassOptions(getDb());

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">Master data</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Tambah siswa</h1>
        </div>
        <StudentForm mode="create" classes={classes} />
      </section>
    </AppShell>
  );
}
