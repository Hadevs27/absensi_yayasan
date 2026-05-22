import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-5">
      <section className="max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center">
        <p className="text-sm font-semibold text-amber-700">403</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-950">Akses dibatasi</h1>
        <p className="mt-2 text-sm text-stone-500">Akun Anda tidak memiliki izin untuk membuka halaman ini.</p>
        <Link href="/dashboard" className="mt-5 inline-flex rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
          Kembali
        </Link>
      </section>
    </main>
  );
}
