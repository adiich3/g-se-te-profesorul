import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, MapPin, Monitor, Users } from "lucide-react";
import type { MatchResult } from "@/lib/types";
import { formatRON, nextSlotLabel } from "@/lib/matching";
import { subjectById } from "@/lib/demo-data";
import { MatchScore } from "./MatchScore";
import { RatingStars } from "./RatingStars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export function TutorCard({ match, showScore = true }: { match: MatchResult; showScore?: boolean }) {
  const { tutor, user, score, reasons } = match;
  const subjectNames = tutor.subjects
    .map((s) => subjectById(s.subjectId)?.name)
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="surface-panel hover-lift flex flex-col gap-4 p-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <Avatar className="size-14 shrink-0">
          <AvatarFallback className="bg-primary-soft font-semibold text-primary">
            {initials(user.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="truncate text-base font-semibold">{user.fullName}</h3>
            {tutor.verified && (
              <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Profil verificat" />
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{tutor.headline}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <RatingStars rating={tutor.rating} count={tutor.reviewCount} className="text-xs" />
            <span className="inline-flex items-center gap-1">
              {tutor.format === "online" ? <Monitor className="size-3.5" /> : <MapPin className="size-3.5" />}
              {tutor.format === "online" ? "Online" : tutor.format === "in-persoana" ? tutor.city : `Online · ${tutor.city}`}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-semibold">{formatRON(tutor.pricePerSession)}</p>
          <p className="text-xs text-muted-foreground">/ ședință</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{subjectNames}</p>

      {showScore && (
        <div className="flex flex-wrap items-center gap-2">
          <MatchScore score={score} />
          {tutor.offersGroupLessons && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Users className="size-3" /> Grupe mici · în curând
            </Badge>
          )}
        </div>
      )}

      {reasons.length > 0 && (
        <ul className="space-y-1 text-sm">
          {reasons.map((r) => (
            <li key={r} className="flex gap-2 text-muted-foreground">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden />
          {nextSlotLabel(tutor.id)}
        </p>
        <Button asChild size="sm">
          <Link to="/profesor/$tutorId" params={{ tutorId: tutor.id }}>
            Vezi profilul
          </Link>
        </Button>
      </div>
    </article>
  );
}
