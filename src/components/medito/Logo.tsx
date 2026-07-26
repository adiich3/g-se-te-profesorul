import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)} aria-label="Medito – acasă">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <GraduationCap className="size-4.5" aria-hidden />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight">Medito</span>
    </Link>
  );
}
