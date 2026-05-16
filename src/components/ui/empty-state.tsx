import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
      {Icon ? (
        <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-stone-600">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      {description ? <p className="mt-1 text-sm text-stone-500">{description}</p> : null}
    </div>
  );
}
