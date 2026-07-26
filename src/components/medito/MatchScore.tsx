import { cn } from "@/lib/utils";

/**
 * Scor de potrivire calculat determinist (materie, nivel, buget, program, format).
 * Nu este un model AI.
 */
export function MatchScore({ score, className }: { score: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary",
        className,
      )}
      title="Scor calculat din materie, nivel, buget, format și disponibilitate"
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden />
      Potrivire {score}%
    </span>
  );
}
