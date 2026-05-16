import { Skeleton } from "@/components/ui/skeleton";

export default function ClustersLoading() {
  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-24" />
      <Skeleton className="h-96" />
    </main>
  );
}
