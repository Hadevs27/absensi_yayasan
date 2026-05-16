import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-96" />
    </main>
  );
}
