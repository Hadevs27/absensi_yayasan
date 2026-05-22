import { AppShell } from "@/components/app-shell";
import { UserForm } from "@/features/users/components/user-form";
import { requireAdmin } from "@/lib/auth";

export default async function CreateUserPage() {
  const session = await requireAdmin();

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div>
          <p className="text-sm font-medium text-emerald-700">Administrasi</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Tambah user</h1>
        </div>
        <UserForm mode="create" />
      </section>
    </AppShell>
  );
}
