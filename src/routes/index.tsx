import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CalendarCheck, Search, Sparkles, Video, Zap } from "lucide-react";
import heroImage from "@/assets/hero-medito.jpg";
import { AppShell } from "@/components/medito/AppShell";
import { TutorCard } from "@/components/medito/TutorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { subjects } from "@/lib/demo-data";
import { findMatches } from "@/lib/matching";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Medito · Găsește profesorul potrivit pentru obiectivul tău" },
      {
        name: "description",
        content:
          "Meditații 1 la 1 online sau în persoană, cu profesori verificați. Spune-ți obiectivul și primești potriviri în câteva secunde.",
      },
      { property: "og:title", content: "Medito · Meditații 1 la 1 pentru obiective clare" },
      {
        property: "og:description",
        content: "Bacalaureat, Evaluare Națională, admitere, limbi străine și materii de facultate.",
      },
    ],
  }),
  component: Landing,
});

const categories = [
  "Matematică",
  "Română",
  "Engleză",
  "Informatică",
  "Fizică",
  "Chimie",
  "Biologie",
  "Bacalaureat",
  "Evaluare Națională",
  "Admitere",
];

const steps = [
  {
    icon: Search,
    title: "Spune-ți obiectivul",
    text: "Clasă, materie, nota de acum și nota pe care o vrei. Durează un minut.",
  },
  {
    icon: Sparkles,
    title: "Primești potriviri",
    text: "Profesori filtrați după materie, nivel, buget, format și programul tău.",
  },
  {
    icon: CalendarCheck,
    title: "Rezervi o oră",
    text: "Alegi un interval liber, confirmi și intri în ședință direct din Medito.",
  },
];

function Landing() {
  const navigate = useNavigate();
  const [need, setNeed] = useState("");
  const curated = findMatches({}).slice(0, 3);

  return (
    <AppShell>
      {/* Hero */}
      <section className="page-container grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary-soft text-primary">
            <Sparkles className="size-3.5" /> Profesori verificați din toată țara
          </Badge>
          <h1 className="mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
            Găsește profesorul potrivit pentru obiectivul tău
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Nu căuta anunțuri. Spune ce ai de recuperat, ce notă vrei și când poți învăța — îți arătăm
            profesorii care chiar se potrivesc.
          </p>

          <form
            className="mt-7 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/cauta", search: { q: need || undefined } });
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={need}
                onChange={(e) => setNeed(e.target.value)}
                aria-label="Descrie de ce ai nevoie"
                placeholder="Ex.: clasa a XII-a, Mate M1, vreau 8.50 la Bac"
                className="h-13 pl-10 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-13 px-6">
              Caută
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Button asChild variant="secondary" size="sm">
              <Link to="/onboarding">
                Răspunde la 6 întrebări <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Link to="/urgent" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              <Zap className="size-4" /> Am nevoie de ajutor azi
            </Link>
          </div>
        </div>

        <div className="relative">
          <img
            src={heroImage}
            width={1200}
            height={1008}
            alt="Elev și profesor lucrând împreună la o lecție de matematică"
            className="w-full rounded-3xl border border-border object-cover shadow-[var(--shadow-lift)]"
          />
          <div className="surface-panel absolute -bottom-6 left-4 hidden max-w-[15rem] gap-3 p-4 sm:flex">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-foreground">
              <Video className="size-4.5" />
            </span>
            <p className="text-sm">
              <span className="font-semibold">Ședințe în platformă</span>
              <br />
              <span className="text-muted-foreground">video, materiale și teme la un loc</span>
            </p>
          </div>
        </div>
      </section>

      {/* Categorii */}
      <section className="page-container py-10">
        <h2 className="text-xl">Categorii căutate</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              to="/cauta"
              search={{ q: c }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Cum funcționează */}
      <section className="border-y border-border bg-surface py-14">
        <div className="page-container">
          <h2 className="text-2xl">Cum funcționează</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-[var(--shadow-soft)]">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Pasul {i + 1}</p>
                  <h3 className="mt-0.5 text-lg">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profesori recomandați */}
      <section className="page-container py-14">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl">Profesori recomandați</h2>
            <p className="mt-1 text-sm text-muted-foreground">Selecție din comunitatea Medito (date demo).</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/cauta">Vezi toți</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {curated.map((m) => (
            <TutorCard key={m.tutor.id} match={m} showScore={false} />
          ))}
        </div>
      </section>

      {/* Profesori CTA */}
      <section className="page-container pb-16">
        <div className="surface-panel grid gap-5 p-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <h2 className="text-xl">Predai? Primește elevi potriviți.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Îți construiești profilul, îți setezi calendarul și primești rezervări. Fără comisioane ascunse.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/profesor-onboarding">Devino profesor</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
