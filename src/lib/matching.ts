import type { ExamGoal, LessonFormat, MatchResult, SchoolLevel, TutorProfile } from "./types";
import { hasSlotToday, nextFreeSlot, subjectById, tutors, userById } from "./demo-data";

export interface MatchCriteria {
  subjectId?: string;
  level?: SchoolLevel;
  exam?: ExamGoal;
  format?: LessonFormat;
  city?: string;
  budgetMax?: number;
  minRating?: number;
  availableToday?: boolean;
  /** zilele preferate, 1 = luni */
  days?: number[];
  fromHour?: number;
  query?: string;
}

/**
 * Potrivire deterministă (fără AI): fiecare criteriu îndeplinit adaugă puncte,
 * iar scorul final este normalizat la 100. Motivele sunt afișate în UI.
 */
export function scoreTutor(tutor: TutorProfile, c: MatchCriteria): MatchResult | null {
  const reasons: string[] = [];
  let points = 0;
  let max = 0;

  // Materie (obligatoriu dacă e cerută)
  max += 30;
  if (c.subjectId) {
    const ts = tutor.subjects.find((s) => s.subjectId === c.subjectId);
    if (!ts) return null;
    points += 30;
    reasons.push(`Predă ${subjectById(c.subjectId)?.name}`);
  } else {
    points += 24;
  }

  // Nivel
  max += 15;
  if (c.level) {
    const ok = tutor.subjects.some((s) => s.levels.includes(c.level!));
    if (!ok) return null;
    points += 15;
    reasons.push(`Lucrează cu elevi de ${levelLabel(c.level)}`);
  } else points += 12;

  // Examen
  max += 15;
  if (c.exam) {
    const ok = tutor.subjects.some((s) => s.exams.includes(c.exam!));
    if (!ok) return null;
    points += 15;
    reasons.push(`Experiență pe ${examLabel(c.exam)}`);
  } else points += 12;

  // Format
  max += 12;
  if (c.format && c.format !== "ambele") {
    if (tutor.format !== "ambele" && tutor.format !== c.format) return null;
    points += 12;
    reasons.push(c.format === "online" ? "Predă online" : `Predă fizic în ${tutor.city}`);
  } else points += 10;

  // Oraș (doar pentru fizic)
  max += 6;
  if (c.format === "in-persoana" && c.city) {
    if (tutor.city.toLowerCase() !== c.city.trim().toLowerCase()) return null;
    points += 6;
    reasons.push(`Este din ${tutor.city}`);
  } else points += 5;

  // Buget
  max += 12;
  if (c.budgetMax) {
    if (tutor.pricePerSession > c.budgetMax) return null;
    points += 12;
    reasons.push(`Se încadrează în buget (${tutor.pricePerSession} RON/ședință)`);
  } else points += 9;

  // Disponibilitate în intervalele preferate
  max += 10;
  const dayMatch =
    c.days && c.days.length
      ? tutor.availability.some(
          (w) => c.days!.includes(w.day) && (!c.fromHour || parseInt(w.to, 10) > c.fromHour),
        )
      : true;
  if (dayMatch) {
    points += 10;
    if (c.days?.length) reasons.push("Are ore libere în intervalele tale");
  }

  if (c.availableToday && !hasSlotToday(tutor.id)) return null;
  if (c.availableToday) reasons.push("Are loc liber azi");

  if (c.minRating && tutor.rating < c.minRating) return null;
  if (tutor.rating >= 4.8)
    reasons.push(`Rating ${tutor.rating.toFixed(1)} din ${tutor.reviewCount} recenzii`);

  if (c.query) {
    const q = c.query.toLowerCase();
    const hay =
      `${tutor.headline} ${tutor.intro} ${tutor.approach} ${userById(tutor.userId)?.fullName}`.toLowerCase();
    if (hay.includes(q)) {
      points += 4;
      max += 4;
    } else {
      max += 4;
    }
  }

  const score = Math.round(Math.min(99, (points / max) * 100));
  const user = userById(tutor.userId)!;
  return { tutor, user, score, reasons: reasons.slice(0, 3) };
}

export function findMatches(c: MatchCriteria): MatchResult[] {
  return tutors
    .map((t) => scoreTutor(t, c))
    .filter((m): m is MatchResult => m !== null)
    .sort((a, b) => b.score - a.score || b.tutor.rating - a.tutor.rating);
}

export function nextSlotLabel(tutorId: string): string {
  const slot = nextFreeSlot(tutorId);
  return slot ? formatSlot(slot.start) : "Fără ore libere momentan";
}

/* ----------------------------- Etichete ---------------------------- */

export function levelLabel(level: SchoolLevel): string {
  return { gimnaziu: "gimnaziu", liceu: "liceu", facultate: "facultate", adult: "adulți" }[level];
}

export function examLabel(exam: ExamGoal): string {
  return {
    bacalaureat: "Bacalaureat",
    "evaluare-nationala": "Evaluare Națională",
    "admitere-facultate": "Admitere la facultate",
    "examen-facultate": "Examene de facultate",
    "certificare-limba": "Certificare de limbă",
    "sprijin-scolar": "Sprijin școlar",
  }[exam];
}

export function formatLabel(f: LessonFormat): string {
  return { online: "Online", "in-persoana": "În persoană", ambele: "Online și în persoană" }[f];
}

/* ----------------------------- Date/oră ---------------------------- */

const TZ = "Europe/Bucharest";

export function formatSlot(iso: string): string {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("ro-RO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TZ,
  }).format(d);
  const time = new Intl.DateTimeFormat("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
  return `${day}, ${time}`;
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso));
}

export function formatRON(value: number): string {
  return `${value} RON`;
}

export const DAY_NAMES = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
