import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, DollarSign, Plus, Users } from "lucide-react";
import { AppShell } from "@/components/medito/AppShell";
import { IntegrationNote } from "@/components/medito/IntegrationNote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookings, subjectById, tutorById, tutorStudents } from "@/lib/demo-data";
import { DAY_NAMES, formatDay, formatRON, formatTime } from "@/lib/matching";
import { toast } from "sonner";

export const Route = createFileRoute("/profesor-dashboard")({
  head: () => ({
    meta: [
      { title: "Panou profesor · Medito" },
      {
        name: "description",
        content: "Ședințele de azi, elevii, calendarul, încasările și notițele post-lecție.",
      },
      { property: "og:title", content: "Panou profesor · Medito" },
      { property: "og:description", content: "Gestionează-ți programul și elevii pe Medito." },
    ],
  }),
  component: TutorDashboard,
});

function TutorDashboard() {
  const tutor = tutorById("t1")!;
  const mine = bookings
    .filter((b) => b.tutorId === "t1")
    .sort((a, b) => a.start.localeCompare(b.start));
  const today = mine.filter((b) => b.start.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const upcoming = mine.filter((b) => b.status === "confirmata" || b.status === "in-asteptare");

  return (
    <AppShell nav="app">
      <div className="page-container py-8">
        <h1 className="text-3xl">Bună, Ioana</h1>
        <p className="mt-1.5 text-muted-foreground">
          {today.length} ședințe azi · {tutorStudents.length} elevi activi
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={CalendarDays}
            value={String(upcoming.length)}
            label="Ședințe programate"
          />
          <StatCard icon={Users} value={String(tutorStudents.length)} label="Elevi activi" />
          <StatCard icon={DollarSign} value={formatRON(2340)} label="Încasări luna aceasta" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl">Programul apropiat</h2>
              <ul className="mt-4 space-y-3">
                {upcoming.map((b) => (
                  <li
                    key={b.id}
                    className="surface-panel grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-medium capitalize">
                        {formatDay(b.start)}, {formatTime(b.start)}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {subjectById(b.subjectId)?.name} · {b.topic}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="font-normal">
                        {b.status === "confirmata" ? "Confirmată" : "De confirmat"}
                      </Badge>
                      <Button asChild size="sm">
                        <Link to="/sedinta/$lessonId" params={{ lessonId: "l3" }}>
                          Începe
                        </Link>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl">Elevii mei</h2>
              <ul className="mt-4 space-y-3">
                {tutorStudents.map((s) => (
                  <li
                    key={s.id}
                    className="surface-panel grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{s.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {subjectById(s.subjectId)?.name} · {s.goal}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {s.lessons} ședințe · ultima notă {s.lastScore.toFixed(1)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface-panel p-6">
              <h2 className="text-xl">După ședință</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Adaugă notițe, temă și materiale pentru ultima lecție.
              </p>
              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Salvat pentru lecția demo");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="notes">Notițe</Label>
                  <Textarea id="notes" placeholder="Ce a mers bine, ce rămâne de exersat…" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hw">Temă</Label>
                  <Input id="hw" placeholder="Ex.: variantă completă, subiectul II" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      toast.info("Încărcarea materialelor necesită stocare securizată în Supabase.")
                    }
                  >
                    <Plus className="size-4" /> Încarcă material
                  </Button>
                  <Button type="submit">Salvează</Button>
                </div>
              </form>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="surface-panel p-5">
              <h2 className="text-lg">Profil completat</h2>
              <Progress value={tutor.profileCompletion} className="mt-3 h-2" />
              <p className="mt-2 text-sm text-muted-foreground">
                {tutor.profileCompletion}% · adaugă un video de prezentare pentru a ajunge la 100%.
              </p>
            </section>
            <section className="surface-panel p-5">
              <h2 className="text-lg">Disponibilitate</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {tutor.availability.map((w) => (
                  <li key={`${w.day}-${w.from}`} className="flex items-center justify-between">
                    <span>{DAY_NAMES[w.day - 1]}</span>
                    <span className="text-muted-foreground">
                      {w.from} – {w.to}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() =>
                  toast.info("Editarea calendarului necesită salvarea disponibilității în backend.")
                }
              >
                Editează calendarul
              </Button>
            </section>
            <IntegrationNote title="Încasări demonstrative">
              Plățile și transferurile către profesori se activează odată cu Stripe Connect.
            </IntegrationNote>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <div className="surface-panel flex items-center gap-3 p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-xl font-semibold">{value}</p>
        <p className="truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
