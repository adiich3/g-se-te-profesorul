import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/medito/AppShell";
import { TutorCard } from "@/components/medito/TutorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { subjects } from "@/lib/demo-data";
import { examLabel, findMatches, levelLabel } from "@/lib/matching";
import type { ExamGoal, LessonFormat, SchoolLevel } from "@/lib/types";

export const Route = createFileRoute("/cauta")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : undefined,
    azi: search.azi === true || search.azi === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Caută profesori · Medito" },
      {
        name: "description",
        content:
          "Filtrează profesori după materie, nivel, examen, preț, format, oraș și disponibilitate.",
      },
      { property: "og:title", content: "Caută profesori · Medito" },
      {
        property: "og:description",
        content: "Rezultate ordonate după cât de bine se potrivesc cu nevoia ta.",
      },
    ],
  }),
  component: SearchPage,
});

const levels: SchoolLevel[] = ["gimnaziu", "liceu", "facultate", "adult"];
const exams: ExamGoal[] = [
  "bacalaureat",
  "evaluare-nationala",
  "admitere-facultate",
  "examen-facultate",
  "certificare-limba",
  "sprijin-scolar",
];

function SearchPage() {
  const { q, azi } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [subjectId, setSubjectId] = useState<string>("toate");
  const [level, setLevel] = useState<string>("toate");
  const [exam, setExam] = useState<string>("toate");
  const [format, setFormat] = useState<LessonFormat | "toate">("toate");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState([200]);
  const [minRating, setMinRating] = useState("0");
  const [today, setToday] = useState(Boolean(azi));

  const matches = useMemo(
    () =>
      findMatches({
        query: query || undefined,
        subjectId: subjectId === "toate" ? undefined : subjectId,
        level: level === "toate" ? undefined : (level as SchoolLevel),
        exam: exam === "toate" ? undefined : (exam as ExamGoal),
        format: format === "toate" ? undefined : format,
        city: city || undefined,
        budgetMax: budget[0],
        minRating: Number(minRating) || undefined,
        availableToday: today || undefined,
      }),
    [query, subjectId, level, exam, format, city, budget, minRating, today],
  );

  const filters = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="q">Caută</Label>
        <Input
          id="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nume, specializare…"
        />
      </div>
      <FilterSelect
        label="Materie"
        value={subjectId}
        onChange={setSubjectId}
        options={[
          ["toate", "Toate materiile"],
          ...subjects.map((s) => [s.id, s.name] as [string, string]),
        ]}
      />
      <FilterSelect
        label="Nivel"
        value={level}
        onChange={setLevel}
        options={[
          ["toate", "Toate nivelurile"],
          ...levels.map((l) => [l, capitalize(levelLabel(l))] as [string, string]),
        ]}
      />
      <FilterSelect
        label="Examen"
        value={exam}
        onChange={setExam}
        options={[
          ["toate", "Toate examenele"],
          ...exams.map((e) => [e, examLabel(e)] as [string, string]),
        ]}
      />
      <FilterSelect
        label="Format"
        value={format}
        onChange={(v) => setFormat(v as LessonFormat | "toate")}
        options={[
          ["toate", "Online și în persoană"],
          ["online", "Doar online"],
          ["in-persoana", "Doar în persoană"],
        ]}
      />
      {format === "in-persoana" && (
        <div className="space-y-2">
          <Label htmlFor="city">Oraș</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex.: Cluj-Napoca"
          />
        </div>
      )}
      <div className="space-y-3">
        <Label>Preț maxim: {budget[0]} RON / ședință</Label>
        <Slider value={budget} onValueChange={setBudget} min={60} max={300} step={10} />
      </div>
      <FilterSelect
        label="Rating minim"
        value={minRating}
        onChange={setMinRating}
        options={[
          ["0", "Orice rating"],
          ["4.5", "4.5+"],
          ["4.8", "4.8+"],
        ]}
      />
      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <Label htmlFor="today" className="cursor-pointer">
          Disponibil azi
        </Label>
        <Switch id="today" checked={today} onCheckedChange={setToday} />
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="page-container py-8">
        <h1 className="text-3xl">Profesori disponibili</h1>
        <p className="mt-1.5 text-muted-foreground">
          {matches.length} {matches.length === 1 ? "profesor găsit" : "profesori găsiți"} · ordonați
          după potrivire
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="surface-panel sticky top-24 p-5">{filters}</div>
          </aside>

          <div>
            <div className="mb-4 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <SlidersHorizontal className="size-4" /> Filtre
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                  <SheetTitle className="px-4 pt-4">Filtre</SheetTitle>
                  <div className="p-4">{filters}</div>
                </SheetContent>
              </Sheet>
            </div>

            {matches.length === 0 ? (
              <div className="surface-panel p-10 text-center">
                <h2 className="text-lg">Niciun profesor pentru filtrele alese</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Încearcă un buget mai mare sau elimină filtrul de disponibilitate.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {matches.map((m) => (
                  <TutorCard key={m.tutor.id} match={m} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
