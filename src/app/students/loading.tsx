import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-20" />
      <Skeleton className="h-96" />
    </main>
  );
}
