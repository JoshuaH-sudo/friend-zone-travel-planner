import { cn } from "@/lib/utils";

export function Progress({
  value = 0,
  className,
}: {
  value?: number;
  className?: string;
}) {
  const width = `${Math.max(0, Math.min(100, value))}%`;
  return (
    <div className={cn("bg-muted h-2 w-full overflow-hidden rounded-full", className)}>
      <div className="bg-primary h-full transition-all" style={{ width }} />
    </div>
  );
}
