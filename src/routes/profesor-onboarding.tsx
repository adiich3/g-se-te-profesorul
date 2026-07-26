import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/medito/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { subjects } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/profesor-onboarding")({
  head: () => ({
    meta: [
      { title: "Devino profesor · Medito" },
      { name: "description", content: "Creează-ți profilul de profesor: materii, niveluri, preț și disponibilitate." },
      { property: "og:title", content: "Devino profesor · Medito" },
      { property: "og:description", content: "Primești elevi potriviți cu specializarea ta." },
    ],
  }),
  component: TutorOnboarding,
});

const TOTAL = 3;

function TutorOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState<string[]>(["mate"]);

  return (
    <AppShell footer={false}>
      <div className="page-narrow py-10">
        <p className="text-sm text-muted-foreground">
          Pasul {step} din {TOTAL}
        </p>
        <Progress value={(step / TOTAL) * 100} className="mt-3 h-1.5" />

        <div className="surface-panel mt-8 space-y-5 p-6 sm:p-8">
          {step === 1 && (
            <>
              <h1 className="text-2xl">Profilul tău</h1>
              <div className="space-y-2">
                <Label htmlFor="name">Nume complet</Label>
                <Input id="name" placeholder="Ioana Munteanu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Titlu scurt</Label>
                <Input id="headline" placeholder="Matematică M1 · Bacalaureat și olimpiadă" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="intro">Prezentare</Label>
                <Textarea id="intro" placeholder="Câțiva ani de experiență, ce rezultate obțin elevii tăi…" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl">Materii și niveluri</h1>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => {
                  const active = picked.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPicked((p) => (active ? p.filter((x) => x !== s.id) : [...p, s.id]))}
                      className={cn(
                        "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                      )}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preț per ședință (RON)</Label>
                  <Input id="price" inputMode="numeric" placeholder="130" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dur">Durata ședinței (min)</Label>
                  <Input id="dur" inputMode="numeric" placeholder="90" />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl">Disponibilitate și format</h1>
              <div className="space-y-2">
                <Label htmlFor="city">Oraș (pentru ședințe fizice)</Label>
                <Input id="city" placeholder="București" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Intervale disponibile</Label>
                <Textarea id="hours" placeholder="Marți și joi, 18:00–21:00" />
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
              Înapoi
            </Button>
            <Button
              size="lg"
              onClick={() => {
                if (step < TOTAL) return setStep(step + 1);
                toast.success("Profil demo creat");
                navigate({ to: "/profesor-dashboard" });
              }}
            >
              {step === TOTAL ? "Finalizează" : "Continuă"}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
