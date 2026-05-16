import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { ClassForm } from "@/features/classes/components/class-form";
import { getClassById, getTeacherOptions } from "@/features/classes/services/class-service";
import { requireAdmin } from "@/lib/auth";

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const db = getDb();
  const [classItem, teachers] = await Promise.all([getClassById(db, id), getTeacherOptions(db)]);

  if (!classItem) {
    notFound();
  }

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">Master data</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Edit kelas</h1>
        </div>
        <ClassForm mode="edit" classId={classItem.id} defaultValues={classItem} teachers={teachers} />
      </section>
    </AppShell>
  );
}
