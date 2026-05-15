import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(120deg,#f7f7f2_0%,#eef7f0_52%,#eef3f8_100%)] px-5 py-10">
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
