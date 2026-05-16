import {
  BarChart3,
  CalendarCheck,
  FileDown,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  School,
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import type { SessionPayload } from "@/lib/session";

type Role = SessionPayload["role"];

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "user"] },
  { href: "/attendance", label: "Absensi", icon: CalendarCheck, roles: ["admin", "user"] },
  { href: "/students", label: "Siswa", icon: GraduationCap, roles: ["admin"] },
  { href: "/classes", label: "Kelas", icon: School, roles: ["admin"] },
  { href: "/reports", label: "Laporan", icon: FileDown, roles: ["admin"] },
  { href: "/clusters", label: "K-Means", icon: GitBranch, roles: ["admin"] },
] satisfies Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}>;

export function AppShell({
  session,
  children,
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-emerald-700 text-white">
              <BarChart3 className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-stone-950">
                {process.env.NEXT_PUBLIC_APP_NAME ?? "Absensi K-Means"}
              </span>
              <span className="block text-xs text-stone-500">Role: {session.role}</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-stone-900">{session.name}</p>
              <p className="text-xs text-stone-500">{session.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto rounded-lg border border-stone-200 bg-white p-2 lg:block lg:space-y-1">
          {navItems
            .filter((item) => item.roles.includes(session.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-emerald-50 hover:text-emerald-800 lg:flex"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
}
