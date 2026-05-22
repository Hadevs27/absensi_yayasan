import Link from "next/link";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { users } from "@/db/schema";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { requireSession } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await getDb().query.users.findFirst({ where: eq(users.id, session.userId) });

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Akun</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Profil</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/profile/security" className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700">Security</Link>
            <Link href="/profile/preferences" className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700">Preferences</Link>
          </div>
        </div>
        <ProfileForm
          defaultValues={{
            name: user?.name ?? session.name,
            phone: user?.phone ?? "",
            address: user?.address ?? "",
            avatarUrl: user?.avatarUrl ?? "",
          }}
        />
      </section>
    </AppShell>
  );
}
