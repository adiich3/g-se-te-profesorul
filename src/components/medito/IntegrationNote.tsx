import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Marchează vizual zonele care așteaptă o integrare externă
 * (video, plăți, storage, email, procesare transcript).
 */
export function IntegrationNote({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-sm",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        {children && <div className="mt-1 text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}
