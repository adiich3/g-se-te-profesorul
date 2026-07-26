import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Heart, Target, Video } from "lucide-react";
import { AppShell } from "@/components/medito/AppShell";
import { initials } from "@/components/medito/TutorCard";
import { RatingStars } from "@/components/medito/RatingStars";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  bookings,
  demoStudentProfile,
  favoriteTutorIds,
  lessonForBooking,
  progress,
  subjectById,
  tutorById,
  userById,
} from "@/lib/demo-data";
import { formatDay, formatRON, formatTime } from "@/lib/matching";
import type { Booking } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Panoul meu · Medito" },
      { name: "description", content: "Următoarea ședință, lecțiile trecute, obiectivele și progresul tău." },
      { property: "og:title", content: "Panoul meu · Medito" },
      { property: "og:description", content: "Tot ce ține de meditațiile tale, într-un singur loc." },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const upcoming = bookings
    .filter((b) => b.status === "confirmata" || b.status === "in-asteptare")
    .sort((a, b) => a.start.localeCompare(b.start));
  const next = upcoming[0];
  const past = bookings.filter((b) => b.status === "finalizata" || b.status === "anulata");
  const last = progress[progress.length - 1];
  const target = demoStudentProfile.targetScore ?? 10;
  const start = progress[0].score;
  const pct = Math.round(((last.score - start) / (target - start)) * 100);

  return (
    <AppShell nav="app">
      <div className="page-container py-8">
        <h1 className="text-3xl">Salut, Andrei 👋</h1>
        <p className="mt-1.5 text-muted-foreground">Ai {upcoming.length} ședințe programate.</p>

        {next && (
          <section className="mt-6 rounded-2xl border border-primary/25 bg-primary-soft p-6">
            <p className="text-sm font-semibold text-primary">Următoarea ședință</p>
            <div className="mt-3 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div className="min-w-0">
                <h2 className="text-2xl capitalize">{formatDay(next.start)}, ora {formatTime(next.start)}</h2>
                <p className="mt-1.5 text-muted-foreground">
                  {subjectById(next.subjectId)?.name} · {next.topic}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  cu {userById(tutorById(next.tutorId)!.userId)!.fullName} · {next.durationMinutes} min ·{" "}
                  {next.format === "online" ? "online" : "în persoană"}
                </p>
              </div>
              <Button asChild size="lg" className="gap-2">
                <Link to="/sedinta/$lessonId" params={{ lessonId: "l3" }}>
                  <Video className="size-4" /> Intră în ședință
                </Link>
              </Button>
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl">Ședințe viitoare</h2>
              <ul className="mt-4 space-y-3">
                {upcoming.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl">Ședințe anterioare</h2>
              <ul className="mt-4 space-y-3">
                {past.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="surface-panel p-5">
              <h2 className="inline-flex items-center gap-2 text-lg">
                <Target className="size-4.5 text-primary" /> Obiectivul meu
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{demoStudentProfile.desiredOutcome}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {last.score.toFixed(2)} acum · țintă {target.toFixed(2)}
                  </span>
                  <span className="font-medium">{pct}%</span>
                </div>
                <Progress value={pct} className="mt-2 h-2" />
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {progress
                  .slice()
                  .reverse()
                  .map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3">
                      <span className="truncate text-muted-foreground">{p.label}</span>
                      <span className="font-medium">{p.score.toFixed(2)}</span>
                    </li>
                  ))}
              </ul>
            </section>

            <section className="surface-panel p-5">
              <h2 className="inline-flex items-center gap-2 text-lg">
                <Heart className="size-4.5 text-primary" /> Profesori favoriți
              </h2>
              <ul className="mt-4 space-y-3">
                {favoriteTutorIds.map((id) => {
                  const t = tutorById(id)!;
                  const u = userById(t.userId)!;
                  return (
                    <li key={id} className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary">
                          {initials(u.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/profesor/$tutorId"
                          params={{ tutorId: id }}
                          className="block truncate text-sm font-medium hover:underline"
                        >
                          {u.fullName}
                        </Link>
                        <RatingStars rating={t.rating} className="text-xs" />
                      </div>
                      <span className="text-sm text-muted-foreground">{formatRON(t.pricePerSession)}</span>
                    </li>
                  );
                })}
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link to="/cauta">Caută profesori noi</Link>
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

const statusStyles: Record<Booking["status"], string> = {
  confirmata: "bg-success/10 text-success",
  "in-asteptare": "bg-accent-soft text-accent-foreground",
  reprogramata: "bg-secondary text-secondary-foreground",
  anulata: "bg-destructive/10 text-destructive",
  finalizata: "bg-secondary text-secondary-foreground",
};

const statusLabels: Record<Booking["status"], string> = {
  confirmata: "Confirmată",
  "in-asteptare": "În așteptare",
  reprogramata: "Reprogramată",
  anulata: "Anulată",
  finalizata: "Finalizată",
};

function BookingRow({ booking }: { booking: Booking }) {
  const tutor = tutorById(booking.tutorId)!;
  const user = userById(tutor.userId)!;
  const lesson = lessonForBooking(booking.id);

  return (
    <li className="surface-panel grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium capitalize">
            {formatDay(booking.start)}, {formatTime(booking.start)}
          </p>
          <Badge className={`${statusStyles[booking.status]} border-0 font-normal hover:opacity-100`}>
            {statusLabels[booking.status]}
          </Badge>
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {subjectById(booking.subjectId)?.name} · {booking.topic}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {user.fullName} · {booking.durationMinutes} min · {formatRON(booking.price)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {booking.status === "finalizata" && lesson && (
          <Button asChild variant="outline" size="sm">
            <Link to="/lectie/$lessonId" params={{ lessonId: lesson.id }}>
              Vezi lecția
            </Link>
          </Button>
        )}
        {(booking.status === "confirmata" || booking.status === "in-asteptare") && (
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/profesor/$tutorId" params={{ tutorId: booking.tutorId }}>
                Reprogramează
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Anulează
            </Button>
          </>
        )}
        {booking.status === "anulata" && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarClock className="size-4" /> Sumă rambursată
          </span>
        )}
      </div>
    </li>
  );
}
