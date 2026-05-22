"use client";

export default function GlobalErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-5">
      <section className="max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center">
        <p className="text-sm font-semibold text-red-700">Error</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-950">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-stone-500">Sistem gagal memproses permintaan. Silakan coba lagi.</p>
        <button onClick={reset} className="mt-5 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">
          Coba lagi
        </button>
      </section>
    </main>
  );
}
