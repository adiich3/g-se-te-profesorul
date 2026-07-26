import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Zap } from "lucide-react";
import { AppShell } from "@/components/medito/AppShell";
import { TutorCard } from "@/components/medito/TutorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subjects } from "@/lib/demo-data";
import { findMatches } from "@/lib/matching";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/urgent")({
  head: () => ({
    meta: [
      { title: "Am nevoie de ajutor azi · Medito" },
      {
        name: "description",
        content: "Alege materia și subiectul și vezi profesorii care mai au ore libere astăzi.",
      },
      { property: "og:title", content: "Am nevoie de ajutor azi · Medito" },
      { property: "og:description", content: "Ședințe rapide, în aceeași zi, cu profesori disponibili acum." },
    ],
  }),
  component: UrgentPage,
});

function UrgentPage() {
  const [subjectId, setSubjectId] = useState("mate");
  const [topic, setTopic] = useState("");
  const matches = findMatches({ subjectId, availableToday: true });

  return (
    <AppShell>
      <div className="page-container py-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent-foreground">
          <Zap className="size-4" /> Ședințe în aceeași zi
        </span>
        <h1 className="mt-4 text-3xl">Am nevoie de ajutor azi</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Test mâine sau temă blocată? Alege materia și vezi cine mai are un interval liber astăzi.
        </p>

        <div className="surface-panel mt-7 space-y-5 p-6">
          <div>
            <Label className="mb-2 block">Materia</Label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={subjectId === s.id}
                  onClick={() => setSubjectId(s.id)}
                  className={cn(
                    "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                    subjectId === s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Clasa și subiectul</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: clasa a X-a, ecuații de gradul II – test mâine"
            />
          </div>
        </div>

        <h2 className="mt-10 text-xl">
          {matches.length ? `${matches.length} profesori cu ore libere azi` : "Niciun profesor liber azi la materia asta"}
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <TutorCard key={m.tutor.id} match={m} />
          ))}
        </div>

        {matches.length === 0 && (
          <Button asChild className="mt-5">
            <Link to="/cauta">Caută pentru zilele următoare</Link>
          </Button>
        )}
      </div>
    </AppShell>
  );
}
