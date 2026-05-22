import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { StudentForm } from "@/features/students/components/student-form";
import { getClassOptions, getStudentById } from "@/features/students/services/student-service";
import { requireAdmin } from "@/lib/auth";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const db = getDb();
  const [student, classes] = await Promise.all([getStudentById(db, id), getClassOptions(db)]);

  if (!student) {
    notFound();
  }

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">Master data</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Edit siswa</h1>
        </div>
        <StudentForm
          mode="edit"
          studentId={student.id}
          defaultValues={{
            nis: student.nis,
            name: student.name,
            gender: student.gender,
            birthDate: student.birthDate,
            address: student.address ?? "",
            parentName: student.parentName ?? "",
            phone: student.phone ?? "",
            classId: student.classId,
            avatarUrl: student.avatarUrl ?? "",
            guardianName: student.guardianName ?? "",
            isActive: student.isActive,
          }}
          classes={classes}
        />
      </section>
    </AppShell>
  );
}
