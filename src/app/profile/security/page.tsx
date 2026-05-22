import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { SecurityForm } from "@/features/profile/components/security-form";
import { requireSession } from "@/lib/auth";

export default async function ProfileSecurityPage() {
  const session = await requireSession();

  return (
    <AppShell session={session}>
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">Akun</p>
            <h1 className="mt-1 text-2xl font-semibold text-stone-950">Keamanan</h1>
          </div>
          <Link href="/profile" className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700">Profil</Link>
        </div>
        <SecurityForm />
      </section>
    </AppShell>
  );
}
