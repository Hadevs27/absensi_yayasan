import Link from "next/link";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/app-shell";
import { getDb } from "@/db/db";
import { users } from "@/db/schema";
import { PreferencesForm } from "@/features/profile/components/preferences-form";
import { requireSession } from "@/lib/auth";

export default async function ProfilePreferencesPage() {
  const session = await requireSession();
  const user = await getDb().query.users.findFirst({ where: eq(users.id, session.userId) });

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Akun</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Preferensi</h1>
          </div>
          <Link href="/profile" className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700">Profil</Link>
        </div>
        <PreferencesForm
          defaultValues={{
            preferredLanguage: (user?.preferredLanguage === "en" ? "en" : "id"),
            themePreference:
              user?.themePreference === "light" || user?.themePreference === "dark"
                ? user.themePreference
                : "system",
          }}
        />
      </section>
    </AppShell>
  );
}
