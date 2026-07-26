import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Link2, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/medito/AppShell";
import { IntegrationNote } from "@/components/medito/IntegrationNote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lessonById, subjectById, tutorById, userById } from "@/lib/demo-data";
import { formatDay, formatTime } from "@/lib/matching";

export const Route = createFileRoute("/lectie/$lessonId")({
  head: () => ({
    meta: [
      { title: "Detalii lecție · Medito" },
      { name: "description", content: "Notițe, teme, materiale, progres și înregistrarea ședinței." },
      { property: "og:title", content: "Detalii lecție · Medito" },
      { property: "og:description", content: "Tot ce a rămas după ședință, într-un singur loc." },
    ],
  }),
  component: LessonArchive,
});

function LessonArchive() {
  const { lessonId } = Route.useParams();
  const lesson = lessonById(lessonId) ?? lessonById("l1")!;
  const tutor = tutorById(lesson.tutorId)!;
  const user = userById(tutor.userId)!;

  return (
    <AppShell nav="app">
      <div className="page-container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-8">
          <header>
            <p className="text-sm text-muted-foreground capitalize">
              {formatDay(lesson.start)}, ora {formatTime(lesson.start)} · {lesson.durationMinutes} min
            </p>
            <h1 className="mt-1 text-3xl">
              {subjectById(lesson.subjectId)?.name} cu {user.fullName}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {lesson.topics.map((t) => (
                <Badge key={t} variant="secondary" className="font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </header>

          <section className="surface-panel overflow-hidden">
            <div className="flex aspect-video items-center justify-center bg-surface">
              <div className="text-center">
                <PlayCircle className="mx-auto size-10 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-sm font-medium">Înregistrarea nu este disponibilă</p>
                <p className="text-sm text-muted-foreground">
                  Se salvează doar dacă ambii participanți au dat acordul în timpul ședinței.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl">Notițele profesorului</h2>
            <p className="mt-3 text-muted-foreground">{lesson.notes ?? "Nu au fost adăugate notițe."}</p>
          </section>

          <section>
            <h2 className="text-xl">Temă</h2>
            {lesson.homework.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Fără temă pentru această ședință.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {lesson.homework.map((h) => (
                  <li key={h.id} className="surface-panel p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{h.title}</p>
                      <Badge variant="outline" className="font-normal">
                        {h.status === "de-facut" ? "De făcut" : h.status === "trimisa" ? "Trimisă" : "Corectată"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground capitalize">Termen: {formatDay(h.dueDate)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-xl">Materiale</h2>
            {lesson.materials.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Fără materiale încărcate.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lesson.materials.map((m) => (
                  <li key={m.id} className="surface-panel flex items-center gap-3 p-4">
                    {m.type === "link" ? (
                      <Link2 className="size-4 text-muted-foreground" />
                    ) : (
                      <FileText className="size-4 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.sizeLabel}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="surface-panel p-5">
            <h2 className="text-lg">Următorul pas</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Continuă cu aceeași structură săptămâna viitoare.</p>
            <Button asChild className="mt-4 w-full">
              <Link to="/rezervare/$tutorId" params={{ tutorId: tutor.id }} search={{ slot: undefined }}>
                Rezervă următoarea ședință
              </Link>
            </Button>
          </div>
          <IntegrationNote title="În pregătire">
            Transcriere automată, rezumat al ședinței, capitole pe minute și întrebări de recapitulare — se
            activează după conectarea procesării audio.
          </IntegrationNote>
        </aside>
      </div>
    </AppShell>
  );
}
