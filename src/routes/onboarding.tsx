import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AppShell } from "@/components/medito/AppShell";
import { TutorCard } from "@/components/medito/TutorCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { subjects } from "@/lib/demo-data";
import { DAY_NAMES, examLabel, findMatches, levelLabel } from "@/lib/matching";
import { saveNeed } from "@/lib/prefs";
import type { ExamGoal, LessonFormat, SchoolLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Spune-ne obiectivul tău · Medito" },
      {
        name: "description",
        content: "Șase pași scurți despre clasă, materie, obiectiv, buget și program, apoi primești potriviri.",
      },
      { property: "og:title", content: "Spune-ne obiectivul tău · Medito" },
      { property: "og:description", content: "Potriviri de profesori pe baza nevoii tale reale." },
    ],
  }),
  component: Onboarding,
});

const levels: SchoolLevel[] = ["gimnaziu", "liceu", "facultate", "adult"];
const goals: ExamGoal[] = [
  "bacalaureat",
  "evaluare-nationala",
  "admitere-facultate",
  "examen-facultate",
  "certificare-limba",
  "sprijin-scolar",
];
const formats: LessonFormat[] = ["online", "in-persoana", "ambele"];
const durations = [50, 60, 90, 120] as const;

const TOTAL = 6;

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<SchoolLevel>("liceu");
  const [grade, setGrade] = useState("clasa a XII-a");
  const [subjectId, setSubjectId] = useState("mate");
  const [current, setCurrent] = useState("6.40");
  const [target, setTarget] = useState("8.50");
  const [goal, setGoal] = useState<ExamGoal>("bacalaureat");
  const [outcome, setOutcome] = useState("");
  const [format, setFormat] = useState<LessonFormat>("online");
  const [city, setCity] = useState("Cluj-Napoca");
  const [budget, setBudget] = useState([80, 150]);
  const [duration, setDuration] = useState<number>(90);
  const [days, setDays] = useState<number[]>([2, 4]);
  const [fromHour, setFromHour] = useState(18);

  const criteria = {
    subjectId,
    level,
    exam: goal,
    format,
    city,
    budgetMax: budget[1],
    days,
    fromHour,
  };
  const matches = findMatches(criteria).slice(0, 6);

  function next() {
    if (step === TOTAL) {
      saveNeed(criteria);
      setStep(TOTAL + 1);
      return;
    }
    setStep((s) => s + 1);
  }

  if (step > TOTAL) {
    return (
      <AppShell>
        <div className="page-container py-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
            <Check className="size-4" /> Profil complet
          </span>
          <h1 className="mt-4 text-3xl">Profesori potriviți pentru tine</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {subjects.find((s) => s.id === subjectId)?.name} · {levelLabel(level)} · {examLabel(goal)} · buget până
            la {budget[1]} RON · {days.map((d) => DAY_NAMES[d - 1]).join(", ")} după {fromHour}:00
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((m) => (
              <TutorCard key={m.tutor.id} match={m} />
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link to="/cauta">Vezi toate rezultatele</Link>
            </Button>
            <Button variant="ghost" onClick={() => setStep(1)}>
              Modifică răspunsurile
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell footer={false}>
      <div className="page-narrow py-10">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Pasul {step} din {TOTAL}
          </span>
          <button type="button" onClick={() => navigate({ to: "/" })} className="hover:text-foreground">
            Renunță
          </button>
        </div>
        <Progress value={(step / TOTAL) * 100} className="mt-3 h-1.5" />

        <div className="surface-panel mt-8 p-6 sm:p-8">
          {step === 1 && (
            <Step title="În ce clasă ești?" hint="Ne ajută să filtrăm profesorii cu experiență pe nivelul tău.">
              <ChoiceGrid
                options={levels.map((l) => ({ value: l, label: capitalize(levelLabel(l)) }))}
                value={level}
                onChange={(v) => setLevel(v as SchoolLevel)}
              />
              <div className="mt-5 space-y-2">
                <Label htmlFor="grade">Clasa sau anul</Label>
                <Input id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} />
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step title="La ce materie ai nevoie de ajutor?" hint="Poți adăuga altele mai târziu din profil.">
              <ChoiceGrid
                options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                value={subjectId}
                onChange={setSubjectId}
                columns={3}
              />
            </Step>
          )}

          {step === 3 && (
            <Step title="Unde ești acum și unde vrei să ajungi?" hint="Notele ne ajută să calibrăm ritmul.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cur">Nota actuală / la simulare</Label>
                  <Input id="cur" inputMode="decimal" value={current} onChange={(e) => setCurrent(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tgt">Nota țintă</Label>
                  <Input id="tgt" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>
              </div>
              <div className="mt-5">
                <Label className="mb-2 block">Obiectivul principal</Label>
                <ChoiceGrid
                  options={goals.map((g) => ({ value: g, label: examLabel(g) }))}
                  value={goal}
                  onChange={(v) => setGoal(v as ExamGoal)}
                  columns={2}
                />
              </div>
              <div className="mt-5 space-y-2">
                <Label htmlFor="out">Ce ai vrea să obții concret? (opțional)</Label>
                <Textarea
                  id="out"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="Ex.: vreau peste 8.50 la Matematică M1 și să înțeleg analiza."
                />
              </div>
            </Step>
          )}

          {step === 4 && (
            <Step title="Cum preferi să înveți?" hint="Pentru ședințe fizice avem nevoie și de oraș.">
              <ChoiceGrid
                options={[
                  { value: "online", label: "Online" },
                  { value: "in-persoana", label: "În persoană" },
                  { value: "ambele", label: "Nu contează" },
                ]}
                value={format}
                onChange={(v) => setFormat(v as LessonFormat)}
                columns={3}
              />
              {format !== "online" && (
                <div className="mt-5 space-y-2">
                  <Label htmlFor="city">Oraș</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              )}
            </Step>
          )}

          {step === 5 && (
            <Step title="Ce buget ai per ședință?" hint="Îți arătăm întâi profesorii care se încadrează.">
              <div className="rounded-xl border border-border p-5">
                <p className="text-2xl font-semibold">
                  {budget[0]} – {budget[1]} RON
                </p>
                <Slider
                  className="mt-5"
                  value={budget}
                  onValueChange={setBudget}
                  min={50}
                  max={300}
                  step={10}
                  aria-label="Interval de buget"
                />
              </div>
              <div className="mt-5">
                <Label className="mb-2 block">Durata preferată a ședinței</Label>
                <ChoiceGrid
                  options={durations.map((d) => ({ value: String(d), label: `${d} min` }))}
                  value={String(duration)}
                  onChange={(v) => setDuration(Number(v))}
                  columns={4}
                />
              </div>
            </Step>
          )}

          {step === 6 && (
            <Step title="Când poți avea ședințe?" hint="Selectează zilele și ora de la care ești liber.">
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((d, i) => {
                  const day = i + 1;
                  const active = days.includes(day);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDays((prev) => (active ? prev.filter((x) => x !== day) : [...prev, day]))}
                      className={cn(
                        "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 rounded-xl border border-border p-5">
                <Label className="mb-3 block">Sunt liber de la ora {fromHour}:00</Label>
                <Slider value={[fromHour]} onValueChange={(v) => setFromHour(v[0])} min={8} max={21} step={1} />
              </div>
            </Step>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-1"
            >
              <ArrowLeft className="size-4" /> Înapoi
            </Button>
            <Button onClick={next} size="lg" className="gap-1">
              {step === TOTAL ? "Vezi potrivirile" : "Continuă"} <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Step({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ChoiceGrid({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-2 sm:grid-cols-3",
        columns === 4 && "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
            value === o.value ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
