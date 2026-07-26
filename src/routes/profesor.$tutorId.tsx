import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Clock, MapPin, MessageCircle, Monitor, PlayCircle, Users } from "lucide-react";
import { AppShell } from "@/components/medito/AppShell";
import { RatingStars } from "@/components/medito/RatingStars";
import { IntegrationNote } from "@/components/medito/IntegrationNote";
import { SlotPicker } from "@/components/medito/SlotPicker";
import { initials } from "@/components/medito/TutorCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { reviewsForTutor, slotsForTutor, subjectById, tutorById, userById } from "@/lib/demo-data";
import { examLabel, formatDay, formatRON, formatTime, levelLabel } from "@/lib/matching";

export const Route = createFileRoute("/profesor/$tutorId")({
  loader: ({ params }) => {
    const tutor = tutorById(params.tutorId);
    if (!tutor) throw notFound();
    return { tutorName: userById(tutor.userId)!.fullName, headline: tutor.headline };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Profil indisponibil · Medito" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.tutorName} · ${loaderData.headline} | Medito`;
    return {
      meta: [
        { title },
        { name: "description", content: `Profil, disponibilitate, preț și recenzii pentru ${loaderData.tutorName} pe Medito.` },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.headline },
      ],
    };
  },
  component: TutorProfilePage,
});

function TutorProfilePage() {
  const { tutorId } = Route.useParams();
  const tutor = tutorById(tutorId)!;
  const user = userById(tutor.userId)!;
  const reviews = reviewsForTutor(tutorId);
  const slots = slotsForTutor(tutorId).filter((s) => !s.booked).slice(0, 10);
  const [selected, setSelected] = useState<string | undefined>(slots[0]?.id);

  return (
    <AppShell>
      <div className="page-container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-8">
          <header className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
            <Avatar className="size-20 shrink-0">
              <AvatarFallback className="bg-primary-soft text-xl font-semibold text-primary">
                {initials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl sm:text-3xl">{user.fullName}</h1>
                {tutor.verified && (
                  <Badge className="gap-1 bg-primary-soft text-primary hover:bg-primary-soft">
                    <BadgeCheck className="size-3.5" /> Verificat
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-muted-foreground">{tutor.headline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <RatingStars rating={tutor.rating} count={tutor.reviewCount} />
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {tutor.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Monitor className="size-4" />
                  {tutor.format === "ambele" ? "Online și în persoană" : tutor.format === "online" ? "Online" : "În persoană"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> Răspunde în ~{tutor.responseTimeMinutes} min
                </span>
              </div>
            </div>
          </header>

          <section className="surface-panel overflow-hidden">
            <div className="flex aspect-video items-center justify-center bg-surface">
              <div className="text-center">
                <PlayCircle className="mx-auto size-12 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-sm font-medium">Video de prezentare</p>
                <p className="text-sm text-muted-foreground">Se încarcă după activarea stocării video.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl">Despre mine</h2>
            <p className="mt-3 text-muted-foreground">{tutor.intro}</p>
            <h3 className="mt-6 text-lg">Cum lucrez</h3>
            <p className="mt-2 text-muted-foreground">{tutor.approach}</p>
          </section>

          <section>
            <h2 className="text-xl">Materii și niveluri</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {tutor.subjects.map((s) => (
                <div key={s.subjectId} className="surface-panel p-4">
                  <p className="font-semibold">{subjectById(s.subjectId)?.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.levels.map(levelLabel).join(", ")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.exams.map((e) => (
                      <Badge key={e} variant="outline" className="font-normal">
                        {examLabel(e)}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-medium">{formatRON(s.pricePerSession)} / ședință</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl">Experiență și calificări</h2>
            <div className="mt-3 flex flex-wrap gap-6 text-sm">
              <Stat value={`${tutor.yearsExperience} ani`} label="experiență" />
              <Stat value={`${tutor.studentsTaught}`} label="elevi pregătiți" />
              <Stat value={`${tutor.reviewCount}`} label="recenzii" />
            </div>
            <ul className="mt-4 space-y-2">
              {tutor.qualifications.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{q.title}</span>
                  <span className="text-muted-foreground">
                    · {q.issuer}, {q.year}
                  </span>
                  <Badge variant={q.verified ? "secondary" : "outline"} className="font-normal">
                    {q.verified ? "Document verificat" : "În curs de verificare"}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl">Recenzii</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Încă nu există recenzii pentru acest profesor.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="surface-panel p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{r.studentName}</p>
                      <RatingStars rating={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDay(r.date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Booking panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-panel p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-2xl font-semibold">{formatRON(tutor.pricePerSession)}</p>
                <p className="text-sm text-muted-foreground">per ședință</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {tutor.lessonDurations.join(" / ")} min
              </div>
            </div>

            <Separator className="my-4" />

            <p className="text-sm font-medium">Primele intervale libere</p>
            <div className="mt-3 max-h-64 overflow-y-auto pr-1">
              <SlotPicker slots={slots} selectedId={selected} onSelect={(s) => setSelected(s.id)} />
            </div>

            <Button asChild size="lg" className="mt-5 w-full">
              <Link to="/rezervare/$tutorId" params={{ tutorId }} search={{ slot: selected }}>
                Rezervă ședința
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="mt-2 w-full gap-2">
              <MessageCircle className="size-4" /> Trimite un mesaj
            </Button>

            {tutor.offersGroupLessons && (
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" /> Grupe mici de 2–4 elevi — în curând
              </p>
            )}

            <IntegrationNote className="mt-4" title="Plata se face la confirmare">
              Procesatorul de plăți (Stripe) se conectează ulterior; acum poți parcurge fluxul complet.
            </IntegrationNote>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-xl font-semibold">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
