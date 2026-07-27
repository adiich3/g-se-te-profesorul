import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Check, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/medito/AppShell";
import { SlotPicker } from "@/components/medito/SlotPicker";
import { IntegrationNote } from "@/components/medito/IntegrationNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slotsForTutor, subjectById, tutorById, userById } from "@/lib/demo-data";
import { formatDay, formatRON, formatTime } from "@/lib/matching";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { profileIdForTutor } from "@/lib/tutor-profile-map";

export const Route = createFileRoute("/rezervare/$tutorId")({
  validateSearch: (search: Record<string, unknown>) => ({
    slot: typeof search.slot === "string" ? search.slot : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Rezervare ședință · Medito" },
      {
        name: "description",
        content: "Alege intervalul, confirmă detaliile lecției și finalizează rezervarea.",
      },
      { property: "og:title", content: "Rezervare ședință · Medito" },
      { property: "og:description", content: "Trei pași până la prima ta ședință pe Medito." },
    ],
  }),
  component: BookingPage,
});

const STEPS = ["Interval", "Detalii", "Plată"];

function BookingPage() {
  const { tutorId } = Route.useParams();
  const { slot: slotFromSearch } = Route.useSearch();
  const navigate = useNavigate();
  const { user: authUser, role } = useAuth();
  const tutor = tutorById(tutorId);
  const [step, setStep] = useState(0);
  const [slotId, setSlotId] = useState<string | undefined>(slotFromSearch);
  const [subjectId, setSubjectId] = useState(tutor?.subjects[0].subjectId ?? "mate");
  const [duration, setDuration] = useState(String(tutor?.lessonDurations[0] ?? 60));
  const [topic, setTopic] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!tutor) {
    return (
      <AppShell>
        <div className="page-narrow py-20 text-center">
          <h1 className="text-2xl">Profesorul nu a fost găsit</h1>
          <Button asChild className="mt-5">
            <Link to="/cauta">Înapoi la căutare</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const user = userById(tutor.userId)!;
  const openSlots = slotsForTutor(tutorId).filter((s) => !s.booked);
  const slot = openSlots.find((s) => s.id === slotId);
  const base =
    tutor.subjects.find((s) => s.subjectId === subjectId)?.pricePerSession ?? tutor.pricePerSession;
  const price = Math.round((base * Number(duration)) / (tutor.lessonDurations[0] || 60));
  const fee = Math.round(price * 0.05);

  if (done) {
    return (
      <AppShell>
        <div className="page-narrow py-14">
          <div className="surface-panel p-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success">
              <Check className="size-6" />
            </span>
            <h1 className="mt-4 text-2xl">Rezervare trimisă</h1>
            <p className="mt-2 text-muted-foreground">
              {user.fullName} · {subjectById(subjectId)?.name}
              <br />
              {slot
                ? `${formatDay(slot.start)}, ora ${formatTime(slot.start)}`
                : "Interval de confirmat"}{" "}
              · {duration} min
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Cererea a fost salvată și așteaptă confirmarea profesorului.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard">Mergi la panoul meu</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/sedinta/$lessonId" params={{ lessonId: "l3" }}>
                  Vezi sala de curs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell footer={false}>
      <div className="page-container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <ol className="flex items-center gap-2 text-sm">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className={`grid size-6 place-items-center rounded-full text-xs font-semibold ${
                    i <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={i === step ? "font-medium" : "text-muted-foreground"}>{s}</span>
                {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" aria-hidden />}
              </li>
            ))}
          </ol>

          <div className="surface-panel mt-6 p-6">
            {step === 0 && (
              <>
                <h1 className="text-2xl">Alege intervalul</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Orele afișate sunt în fusul orar al României.
                </p>
                <div className="mt-6">
                  <SlotPicker
                    slots={openSlots}
                    selectedId={slotId}
                    onSelect={(s) => setSlotId(s.id)}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="text-2xl">Detaliile ședinței</h1>
                <div className="mt-6 space-y-5">
                  <div className="space-y-2">
                    <Label>Materie</Label>
                    <Select value={subjectId} onValueChange={setSubjectId}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.subjects.map((s) => (
                          <SelectItem key={s.subjectId} value={s.subjectId}>
                            {subjectById(s.subjectId)?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Durată</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.lessonDurations.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {d} minute
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Ce vrei să lucrați?</Label>
                    <Textarea
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ex.: subiectul III, șiruri și limite – am nevoie de exerciții tip Bac."
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl">Plată</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Plătești doar după ce profesorul confirmă ședința.
                </p>
                <div className="mt-6 space-y-4 opacity-90">
                  <div className="space-y-2">
                    <Label htmlFor="card">Card</Label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="card"
                        disabled
                        placeholder="•••• •••• •••• 4242"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input disabled placeholder="MM / AA" />
                    <Input disabled placeholder="CVC" />
                  </div>
                </div>
                <IntegrationNote className="mt-5" title="Câmpuri de plată dezactivate">
                  Checkoutul este pregătit pentru Stripe: rezervarea creează o intenție de plată,
                  iar confirmarea profesorului declanșează încasarea și, ulterior, plata către
                  profesor.
                </IntegrationNote>
                <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5" /> Datele cardului nu sunt stocate de Medito.
                </p>
              </>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() =>
                  step === 0
                    ? navigate({ to: "/profesor/$tutorId", params: { tutorId } })
                    : setStep(step - 1)
                }
              >
                Înapoi
              </Button>
              <Button
                size="lg"
                disabled={(step === 0 && !slot) || submitting}
                onClick={async () => {
                  if (step === 0 && !slot) return;

                  if (step < 2) {
                    setStep(step + 1);
                    return;
                  }

                  if (!authUser) {
                    toast.error("Trebuie să fii autentificat pentru a rezerva.");
                    navigate({ to: "/auth" });
                    return;
                  }

                  if (role !== "student") {
                    toast.error("Doar conturile de elev pot crea rezervări.");
                    return;
                  }

                  if (!slot) {
                    toast.error("Selectează un interval.");
                    return;
                  }

                  const tutorProfileId = profileIdForTutor(tutorId);

                  if (!tutorProfileId) {
                    toast.error("Profesorul nu este conectat încă la un profil.");
                    return;
                  }

                  setSubmitting(true);

                  const { error } = await supabase
                    .from("bookings")
                    .insert({
                      student_id: authUser.id,
                      tutor_id: tutorProfileId,
                      scheduled_at: slot.start,
                      duration_minutes: Number(duration),
                      subject: subjectById(subjectId)?.name ?? subjectId,
                      notes: topic.trim() || null,
                      status: "pending",
                    });

                  setSubmitting(false);

                  if (error) {
                    console.error("Booking error:", error);
                    toast.error(`Rezervarea a eșuat: ${error.message}`);
                    return;
                  }

                  toast.success("Rezervarea a fost trimisă profesorului.");
                  setDone(true);
                }}
              >
                {submitting ? "Se trimite..." : step === 2 ? "Confirmă rezervarea" : "Continuă"}
              </Button>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-panel p-5">
            <p className="font-semibold">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{tutor.headline}</p>
            <Separator className="my-4" />
            <dl className="space-y-2.5 text-sm">
              <Row label="Materie" value={subjectById(subjectId)?.name ?? "-"} />
              <Row label="Durată" value={`${duration} min`} />
              <Row
                label="Interval"
                value={slot ? `${formatDay(slot.start)}, ${formatTime(slot.start)}` : "neselectat"}
              />
              <Row
                label="Format"
                value={tutor.format === "in-persoana" ? `În persoană · ${tutor.city}` : "Online"}
              />
            </dl>
            <Separator className="my-4" />
            <dl className="space-y-2.5 text-sm">
              <Row label="Ședință" value={formatRON(price)} />
              <Row label="Taxă platformă" value={formatRON(fee)} />
              <div className="flex items-center justify-between pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{formatRON(price + fee)}</span>
              </div>
            </dl>
            <p className="mt-4 inline-flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Anulare gratuită cu 12 ore înainte. Reprogramarea se face din panoul tău.
            </p>
            <p className="mt-2 inline-flex items-start gap-2 text-xs text-muted-foreground">
              <CalendarClock className="mt-0.5 size-3.5 shrink-0" />
              Primești reminder cu 24 de ore și cu 1 oră înainte.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
