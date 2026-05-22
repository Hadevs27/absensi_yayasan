import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { UserForm } from "@/features/users/components/user-form";
import { getUserById } from "@/features/users/services/user-service";
import { requireAdmin } from "@/lib/auth";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  const { id } = await params;
  const user = await getUserById(getDb(), id);

  if (!user) {
    notFound();
  }

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">Administrasi</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Edit user</h1>
        </div>
        <UserForm
          mode="edit"
          userId={user.id}
          defaultValues={{
            name: user.name,
            email: user.email,
            role: user.role,
            employeeCode: user.employeeCode,
            avatarUrl: user.avatarUrl ?? "",
            phone: user.phone ?? "",
            address: user.address ?? "",
            preferredLanguage: user.preferredLanguage === "en" ? "en" : "id",
            themePreference:
              user.themePreference === "light" || user.themePreference === "dark"
                ? user.themePreference
                : "system",
            isActive: user.isActive,
          }}
        />
      </section>
    </AppShell>
  );
}
