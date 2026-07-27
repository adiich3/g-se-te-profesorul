import type {
  AvailabilitySlot,
  Booking,
  Conversation,
  Homework,
  Lesson,
  Material,
  Payment,
  ProgressEntry,
  Review,
  StudentProfile,
  Subject,
  TutorProfile,
  User,
} from "./types";

/**
 * DEMO DATA – conținut fictiv folosit până la conectarea backendului.
 * Structura respectă exact tipurile din `types.ts`, deci poate fi înlocuită
 * cu apeluri reale (Lovable Cloud / Postgres) fără schimbări în UI.
 */
export const IS_DEMO_DATA = true;

/* ------------------------------------------------------------------ */
/* Date utils – calculate în fusul orar al României ca SSR și client   */
/* să producă exact aceleași valori.                                    */
/* ------------------------------------------------------------------ */
const TZ = "Europe/Bucharest";
const dateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partsInBucharest(date: Date) {
  const parts = Object.fromEntries(
    dateParts
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

const today = partsInBucharest(new Date());
const noonUtc = new Date(Date.UTC(today.year, today.month - 1, today.day, 12));
const noonInBucharest = partsInBucharest(noonUtc);
const offsetMs =
  Date.UTC(
    noonInBucharest.year,
    noonInBucharest.month - 1,
    noonInBucharest.day,
    noonInBucharest.hour,
    noonInBucharest.minute,
    noonInBucharest.second,
  ) - noonUtc.getTime();
const dayStart = Date.UTC(today.year, today.month - 1, today.day) - offsetMs;

export function isoAt(dayOffset: number, hour: number, minute = 0): string {
  return new Date(dayStart + dayOffset * 86400000 + hour * 3600000 + minute * 60000).toISOString();
}

export const subjects: Subject[] = [
  { id: "mate", name: "Matematică", slug: "matematica", emoji: "∑", group: "stiinte" },
  { id: "romana", name: "Română", slug: "romana", emoji: "✒", group: "umaniste" },
  { id: "engleza", name: "Engleză", slug: "engleza", emoji: "EN", group: "limbi" },
  { id: "info", name: "Informatică", slug: "informatica", emoji: "{}", group: "it" },
  { id: "fizica", name: "Fizică", slug: "fizica", emoji: "⚛", group: "stiinte" },
  { id: "chimie", name: "Chimie", slug: "chimie", emoji: "⚗", group: "stiinte" },
  { id: "biologie", name: "Biologie", slug: "biologie", emoji: "🧬", group: "stiinte" },
  { id: "istorie", name: "Istorie", slug: "istorie", emoji: "🏛", group: "umaniste" },
  { id: "germana", name: "Germană", slug: "germana", emoji: "DE", group: "limbi" },
  { id: "economie", name: "Economie", slug: "economie", emoji: "📈", group: "umaniste" },
];

export function subjectById(id: string): Subject | undefined {
  return subjects.find((s) => s.id === id);
}

export const users: User[] = [
  {
    id: "u-student",
    role: "student",
    fullName: "Andrei Popescu",
    email: "andrei.demo@medito.ro",
    city: "Cluj-Napoca",
    createdAt: isoAt(-40, 9),
  },
  {
    id: "u-t1",
    role: "tutor",
    fullName: "Ioana Munteanu",
    email: "ioana.demo@medito.ro",
    city: "București",
    createdAt: isoAt(-300, 9),
  },
  {
    id: "u-t2",
    role: "tutor",
    fullName: "Radu Ionescu",
    email: "radu.demo@medito.ro",
    city: "Cluj-Napoca",
    createdAt: isoAt(-280, 9),
  },
  {
    id: "u-t3",
    role: "tutor",
    fullName: "Elena Dragomir",
    email: "elena.demo@medito.ro",
    city: "Iași",
    createdAt: isoAt(-260, 9),
  },
  {
    id: "u-t4",
    role: "tutor",
    fullName: "Mihai Stoica",
    email: "mihai.demo@medito.ro",
    city: "Timișoara",
    createdAt: isoAt(-240, 9),
  },
  {
    id: "u-t5",
    role: "tutor",
    fullName: "Ana-Maria Vlad",
    email: "ana.demo@medito.ro",
    city: "București",
    createdAt: isoAt(-220, 9),
  },
  {
    id: "u-t6",
    role: "tutor",
    fullName: "Cristian Barbu",
    email: "cristian.demo@medito.ro",
    city: "Brașov",
    createdAt: isoAt(-200, 9),
  },
  {
    id: "u-t7",
    role: "tutor",
    fullName: "Diana Georgescu",
    email: "diana.demo@medito.ro",
    city: "Sibiu",
    createdAt: isoAt(-180, 9),
  },
  {
    id: "u-t8",
    role: "tutor",
    fullName: "Vlad Petrescu",
    email: "vlad.demo@medito.ro",
    city: "București",
    createdAt: isoAt(-160, 9),
  },
  {
    id: "u-admin",
    role: "admin",
    fullName: "Echipa Medito",
    email: "admin@medito.ro",
    createdAt: isoAt(-365, 9),
  },
];

export function userById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

const evening = [
  { day: 2, from: "18:00", to: "21:00" },
  { day: 4, from: "18:00", to: "21:00" },
];

export const tutors: TutorProfile[] = [
  {
    id: "t1",
    userId: "u-t1",
    headline: "Matematică M1 · Bacalaureat și olimpiadă",
    intro:
      "Predau matematică de 11 ani, majoritatea elevilor mei dau Bacalaureatul la M1. Lucrăm structurat pe subiecte de examen și pe lacunele reale, nu pe teorie fără sens.",
    approach:
      "Începem cu un test de diagnostic, stabilim un plan pe 12 săptămâni și lucrăm variante reale. Fiecare ședință se termină cu temă scurtă și feedback scris.",
    city: "București",
    format: "ambele",
    yearsExperience: 11,
    subjects: [
      {
        subjectId: "mate",
        levels: ["liceu", "gimnaziu"],
        exams: ["bacalaureat", "evaluare-nationala", "admitere-facultate"],
        pricePerSession: 130,
      },
    ],
    qualifications: [
      {
        id: "q1",
        title: "Licență Matematică",
        issuer: "Universitatea din București",
        year: 2012,
        verified: true,
      },
      { id: "q2", title: "Grad didactic II", issuer: "MEN", year: 2018, verified: false },
    ],
    lessonDurations: [60, 90],
    pricePerSession: 130,
    rating: 4.9,
    reviewCount: 128,
    studentsTaught: 214,
    verified: true,
    offersGroupLessons: true,
    responseTimeMinutes: 25,
    availability: evening,
    profileCompletion: 96,
  },
  {
    id: "t2",
    userId: "u-t2",
    headline: "Informatică · C++, algoritmi și admitere",
    intro:
      "Software engineer și profesor part-time. Pregătesc elevi pentru Bacalaureat la Informatică și pentru admiterea la Automatică și Info.",
    approach:
      "Cod scris împreună, live, cu probleme din variante și de pe pbinfo. Fiecare temă primește review linie cu linie.",
    city: "Cluj-Napoca",
    format: "online",
    yearsExperience: 7,
    subjects: [
      {
        subjectId: "info",
        levels: ["liceu", "facultate"],
        exams: ["bacalaureat", "admitere-facultate", "examen-facultate"],
        pricePerSession: 150,
      },
      { subjectId: "mate", levels: ["liceu"], exams: ["bacalaureat"], pricePerSession: 140 },
    ],
    qualifications: [
      { id: "q3", title: "Licență Informatică", issuer: "UBB Cluj", year: 2016, verified: true },
    ],
    lessonDurations: [60, 90, 120],
    pricePerSession: 150,
    rating: 4.8,
    reviewCount: 74,
    studentsTaught: 96,
    verified: true,
    offersGroupLessons: true,
    responseTimeMinutes: 40,
    availability: [
      { day: 1, from: "17:00", to: "20:00" },
      { day: 3, from: "18:00", to: "22:00" },
      { day: 6, from: "10:00", to: "14:00" },
    ],
    profileCompletion: 88,
  },
  {
    id: "t3",
    userId: "u-t3",
    headline: "Limba și literatura română · Bacalaureat",
    intro:
      "Profesoară de română cu 15 ani la catedră. Elevii mei ajung constant peste nota 8.50 la proba de română.",
    approach:
      "Lucrăm pe eseuri structurate, plan de idei și exprimare. Fiecare eseu primește corectură cu barem oficial.",
    city: "Iași",
    format: "ambele",
    yearsExperience: 15,
    subjects: [
      {
        subjectId: "romana",
        levels: ["liceu", "gimnaziu"],
        exams: ["bacalaureat", "evaluare-nationala"],
        pricePerSession: 110,
      },
    ],
    qualifications: [
      {
        id: "q4",
        title: "Licență Litere",
        issuer: "Universitatea Al. I. Cuza",
        year: 2008,
        verified: true,
      },
      { id: "q5", title: "Grad didactic I", issuer: "MEN", year: 2016, verified: true },
    ],
    lessonDurations: [60, 90],
    pricePerSession: 110,
    rating: 5.0,
    reviewCount: 91,
    studentsTaught: 143,
    verified: true,
    offersGroupLessons: false,
    responseTimeMinutes: 60,
    availability: [
      { day: 2, from: "16:00", to: "20:00" },
      { day: 5, from: "16:00", to: "19:00" },
    ],
    profileCompletion: 92,
  },
  {
    id: "t4",
    userId: "u-t4",
    headline: "Fizică și Matematică · Evaluare Națională",
    intro:
      "Lucrez mai ales cu elevi de gimnaziu care au nevoie să recupereze rapid și să prindă încredere.",
    approach: "Explicații simple, multe exemple din viața reală și exerciții gradual mai grele.",
    city: "Timișoara",
    format: "in-persoana",
    yearsExperience: 9,
    subjects: [
      {
        subjectId: "fizica",
        levels: ["gimnaziu", "liceu"],
        exams: ["bacalaureat", "sprijin-scolar"],
        pricePerSession: 100,
      },
      {
        subjectId: "mate",
        levels: ["gimnaziu"],
        exams: ["evaluare-nationala", "sprijin-scolar"],
        pricePerSession: 95,
      },
    ],
    qualifications: [
      { id: "q6", title: "Licență Fizică", issuer: "UVT", year: 2014, verified: false },
    ],
    lessonDurations: [50, 60],
    pricePerSession: 100,
    rating: 4.7,
    reviewCount: 46,
    studentsTaught: 68,
    verified: false,
    offersGroupLessons: true,
    responseTimeMinutes: 90,
    availability: [
      { day: 1, from: "15:00", to: "18:00" },
      { day: 4, from: "15:00", to: "19:00" },
    ],
    profileCompletion: 71,
  },
  {
    id: "t5",
    userId: "u-t5",
    headline: "Engleză · Cambridge, IELTS și conversație",
    intro:
      "Trainer de engleză, pregătesc certificări Cambridge C1 și IELTS, dar și engleză de business pentru adulți.",
    approach: "80% vorbire, materiale autentice, feedback pe pronunție și structuri.",
    city: "București",
    format: "online",
    yearsExperience: 8,
    subjects: [
      {
        subjectId: "engleza",
        levels: ["liceu", "facultate", "adult"],
        exams: ["certificare-limba", "bacalaureat"],
        pricePerSession: 120,
      },
    ],
    qualifications: [
      { id: "q7", title: "CELTA", issuer: "Cambridge Assessment", year: 2017, verified: true },
    ],
    lessonDurations: [50, 60],
    pricePerSession: 120,
    rating: 4.9,
    reviewCount: 152,
    studentsTaught: 230,
    verified: true,
    offersGroupLessons: true,
    responseTimeMinutes: 15,
    availability: [
      { day: 2, from: "18:00", to: "22:00" },
      { day: 4, from: "18:00", to: "22:00" },
      { day: 7, from: "10:00", to: "13:00" },
    ],
    profileCompletion: 100,
  },
  {
    id: "t6",
    userId: "u-t6",
    headline: "Chimie și Biologie · admitere la Medicină",
    intro:
      "Pregătesc candidați pentru admiterea la UMF. Cunosc bibliografia la zi și tipurile de grile.",
    approach: "Grile săptămânale, simulări cronometrate și plan de recapitulare pe capitole.",
    city: "Brașov",
    format: "ambele",
    yearsExperience: 12,
    subjects: [
      {
        subjectId: "chimie",
        levels: ["liceu"],
        exams: ["admitere-facultate", "bacalaureat"],
        pricePerSession: 160,
      },
      {
        subjectId: "biologie",
        levels: ["liceu"],
        exams: ["admitere-facultate", "bacalaureat"],
        pricePerSession: 160,
      },
    ],
    qualifications: [
      {
        id: "q8",
        title: "Doctorat Chimie",
        issuer: "Universitatea Transilvania",
        year: 2015,
        verified: true,
      },
    ],
    lessonDurations: [90, 120],
    pricePerSession: 160,
    rating: 4.8,
    reviewCount: 63,
    studentsTaught: 84,
    verified: true,
    offersGroupLessons: true,
    responseTimeMinutes: 120,
    availability: [
      { day: 3, from: "17:00", to: "21:00" },
      { day: 6, from: "09:00", to: "13:00" },
    ],
    profileCompletion: 84,
  },
  {
    id: "t7",
    userId: "u-t7",
    headline: "Germană · A1–B2 și examene Goethe",
    intro: "Predau germană copiilor și adulților, cu accent pe conversație și gramatică aplicată.",
    approach: "Lecții tematice, vocabular contextual și mini-teste la final de capitol.",
    city: "Sibiu",
    format: "ambele",
    yearsExperience: 6,
    subjects: [
      {
        subjectId: "germana",
        levels: ["gimnaziu", "liceu", "adult"],
        exams: ["certificare-limba", "sprijin-scolar"],
        pricePerSession: 105,
      },
    ],
    qualifications: [
      { id: "q9", title: "Licență Germanistică", issuer: "ULBS", year: 2018, verified: true },
    ],
    lessonDurations: [50, 60],
    pricePerSession: 105,
    rating: 4.6,
    reviewCount: 38,
    studentsTaught: 52,
    verified: true,
    offersGroupLessons: false,
    responseTimeMinutes: 45,
    availability: [
      { day: 2, from: "17:00", to: "20:00" },
      { day: 5, from: "17:00", to: "20:00" },
    ],
    profileCompletion: 77,
  },
  {
    id: "t8",
    userId: "u-t8",
    headline: "Analiză matematică și Algebră · nivel facultate",
    intro:
      "Asistent universitar. Ajut studenți din anul I–II să treacă examenele de analiză, algebră și probabilități.",
    approach: "Rezolvăm subiecte din anii trecuți și clarificăm demonstrațiile pas cu pas.",
    city: "București",
    format: "online",
    yearsExperience: 5,
    subjects: [
      {
        subjectId: "mate",
        levels: ["facultate"],
        exams: ["examen-facultate"],
        pricePerSession: 170,
      },
      {
        subjectId: "economie",
        levels: ["facultate"],
        exams: ["examen-facultate"],
        pricePerSession: 150,
      },
    ],
    qualifications: [
      {
        id: "q10",
        title: "Master Matematică Aplicată",
        issuer: "Politehnica București",
        year: 2020,
        verified: true,
      },
    ],
    lessonDurations: [60, 90, 120],
    pricePerSession: 170,
    rating: 4.7,
    reviewCount: 29,
    studentsTaught: 41,
    verified: true,
    offersGroupLessons: true,
    responseTimeMinutes: 30,
    availability: [
      { day: 1, from: "19:00", to: "22:00" },
      { day: 3, from: "19:00", to: "22:00" },
      { day: 7, from: "16:00", to: "20:00" },
    ],
    profileCompletion: 68,
  },
];

export function tutorById(id: string): TutorProfile | undefined {
  return tutors.find((t) => t.id === id);
}

/* ---------------------------- Sloturi ----------------------------- */

const slotPlan: Array<{ tutorId: string; day: number; hour: number; booked?: boolean }> = [];
tutors.forEach((t, i) => {
  const hours = [16, 18, 19, 20];
  for (let d = 0; d <= 6; d++) {
    const hour = hours[(i + d) % hours.length];
    if ((i + d) % 3 === 0) continue;
    slotPlan.push({ tutorId: t.id, day: d, hour, booked: (i + d) % 5 === 0 });
    if ((i + d) % 2 === 0) slotPlan.push({ tutorId: t.id, day: d, hour: hour + 2 });
  }
});

export const slots: AvailabilitySlot[] = slotPlan.map((p, idx) => {
  const tutor = tutorById(p.tutorId)!;
  return {
    id: `s-${idx}`,
    tutorId: p.tutorId,
    start: isoAt(p.day, p.hour),
    durationMinutes: tutor.lessonDurations[0],
    format: tutor.format === "in-persoana" ? "in-persoana" : "online",
    booked: Boolean(p.booked),
  };
});

export function slotsForTutor(tutorId: string): AvailabilitySlot[] {
  return slots.filter((s) => s.tutorId === tutorId).sort((a, b) => a.start.localeCompare(b.start));
}

export function nextFreeSlot(tutorId: string): AvailabilitySlot | undefined {
  return slotsForTutor(tutorId).find((s) => !s.booked);
}

export function hasSlotToday(tutorId: string): boolean {
  return slotsForTutor(tutorId).some((s) => !s.booked && s.start < isoAt(1, 0));
}

/* --------------------------- Recenzii ----------------------------- */

export const reviews: Review[] = [
  {
    id: "r1",
    tutorId: "t1",
    studentName: "Maria D.",
    rating: 5,
    date: isoAt(-12, 10),
    text: "Am crescut de la 6.20 la 8.90 la simulare în trei luni. Explică extrem de clar.",
  },
  {
    id: "r2",
    tutorId: "t1",
    studentName: "Ștefan P.",
    rating: 5,
    date: isoAt(-30, 10),
    text: "Foarte organizată, primesc temă și feedback după fiecare ședință.",
  },
  {
    id: "r3",
    tutorId: "t1",
    studentName: "Alexandra M.",
    rating: 4,
    date: isoAt(-55, 10),
    text: "Ritm alert, dar exact ce îmi trebuia înainte de Bac.",
  },
  {
    id: "r4",
    tutorId: "t2",
    studentName: "Tudor V.",
    rating: 5,
    date: isoAt(-8, 10),
    text: "Am intrat la Automatică. Problemele alese au fost fix pe profilul admiterii.",
  },
  {
    id: "r5",
    tutorId: "t3",
    studentName: "Ioana C.",
    rating: 5,
    date: isoAt(-20, 10),
    text: "Eseurile mele au altă formă acum. Corectura cu barem ajută enorm.",
  },
  {
    id: "r6",
    tutorId: "t5",
    studentName: "Bogdan A.",
    rating: 5,
    date: isoAt(-5, 10),
    text: "Am luat C1 Advanced din prima. Multă conversație, zero plictiseală.",
  },
  {
    id: "r7",
    tutorId: "t6",
    studentName: "Rareș N.",
    rating: 5,
    date: isoAt(-17, 10),
    text: "Simulările cronometrate m-au pregătit perfect pentru grilele de la UMF.",
  },
];

export function reviewsForTutor(tutorId: string): Review[] {
  return reviews.filter((r) => r.tutorId === tutorId);
}

/* ---------------------- Elev demo + activitate --------------------- */

export const demoStudentProfile: StudentProfile = {
  id: "sp-1",
  userId: "u-student",
  level: "liceu",
  grade: "clasa a XII-a",
  subjectIds: ["mate"],
  currentScore: 6.4,
  targetScore: 8.5,
  goal: "bacalaureat",
  desiredOutcome: "Vreau peste 8.50 la Matematică M1 la Bacalaureat.",
  format: "online",
  city: "Cluj-Napoca",
  budgetMin: 80,
  budgetMax: 150,
  lessonDuration: 90,
  availability: evening,
};

export const bookings: Booking[] = [
  {
    id: "b1",
    studentId: "u-student",
    tutorId: "t1",
    slotId: "s-1",
    subjectId: "mate",
    topic: "Șiruri și limite – subiectul III",
    start: isoAt(0, 18),
    durationMinutes: 90,
    format: "online",
    price: 130,
    status: "confirmata",
    seats: 1,
    createdAt: isoAt(-6, 12),
  },
  {
    id: "b2",
    studentId: "u-student",
    tutorId: "t1",
    slotId: "s-2",
    subjectId: "mate",
    topic: "Analiză matematică – integrale",
    start: isoAt(3, 18),
    durationMinutes: 90,
    format: "online",
    price: 130,
    status: "confirmata",
    seats: 1,
    createdAt: isoAt(-6, 12),
  },
  {
    id: "b3",
    studentId: "u-student",
    tutorId: "t2",
    slotId: "s-9",
    subjectId: "info",
    topic: "Backtracking – probleme de examen",
    start: isoAt(5, 19),
    durationMinutes: 60,
    format: "online",
    price: 150,
    status: "in-asteptare",
    seats: 1,
    createdAt: isoAt(-1, 12),
  },
  {
    id: "b4",
    studentId: "u-student",
    tutorId: "t1",
    slotId: "s-30",
    subjectId: "mate",
    topic: "Funcții – recapitulare",
    start: isoAt(-7, 18),
    durationMinutes: 90,
    format: "online",
    price: 130,
    status: "finalizata",
    seats: 1,
    createdAt: isoAt(-14, 12),
  },
  {
    id: "b5",
    studentId: "u-student",
    tutorId: "t1",
    slotId: "s-31",
    subjectId: "mate",
    topic: "Combinatorică și probabilități",
    start: isoAt(-14, 18),
    durationMinutes: 90,
    format: "online",
    price: 130,
    status: "finalizata",
    seats: 1,
    createdAt: isoAt(-21, 12),
  },
  {
    id: "b6",
    studentId: "u-student",
    tutorId: "t3",
    slotId: "s-40",
    subjectId: "romana",
    topic: "Eseu – romanul interbelic",
    start: isoAt(-3, 17),
    durationMinutes: 60,
    format: "online",
    price: 110,
    status: "anulata",
    seats: 1,
    createdAt: isoAt(-10, 12),
  },
];

export const payments: Payment[] = bookings.map((b, i) => ({
  id: `p-${i}`,
  bookingId: b.id,
  amount: b.price,
  currency: "RON",
  status:
    b.status === "finalizata" ? "platita" : b.status === "anulata" ? "rambursata" : "in-procesare",
  method: "card",
}));

const materials: Material[] = [
  {
    id: "m1",
    lessonId: "l1",
    name: "Fișă – funcții și grafice.pdf",
    type: "pdf",
    sizeLabel: "1,2 MB",
  },
  {
    id: "m2",
    lessonId: "l1",
    name: "Variantă Bac rezolvată.pdf",
    type: "pdf",
    sizeLabel: "820 KB",
  },
  { id: "m3", lessonId: "l1", name: "Recapitulare video – limite", type: "link" },
];

const homework: Homework[] = [
  {
    id: "h1",
    lessonId: "l1",
    title: "Exercițiile 1–8, fișa de funcții",
    description:
      "Rezolvă exercițiile și trimite pozele cu rezolvările înainte de următoarea ședință.",
    dueDate: isoAt(2, 20),
    status: "de-facut",
  },
  {
    id: "h2",
    lessonId: "l2",
    title: "Variantă completă subiectul II",
    description: "Cronometrează-te: maximum 45 de minute.",
    dueDate: isoAt(-9, 20),
    status: "corectata",
  },
];

export const lessons: Lesson[] = [
  {
    id: "l1",
    bookingId: "b4",
    studentId: "u-student",
    tutorId: "t1",
    subjectId: "mate",
    start: isoAt(-7, 18),
    durationMinutes: 90,
    status: "finalizata",
    topics: [
      "Funcții injective și surjective",
      "Grafice și monotonie",
      "Subiectul II – tipare frecvente",
    ],
    notes:
      "Andrei stăpânește definițiile, dar pierde puncte la justificări. Am lucrat pe scrierea completă a raționamentului. Recomand 3 variante suplimentare până săptămâna viitoare.",
    materials,
    homework: [homework[0]],
    recording: {
      id: "rec1",
      lessonId: "l1",
      consentStudent: true,
      consentTutor: true,
      status: "indisponibila",
    },
  },
  {
    id: "l2",
    bookingId: "b5",
    studentId: "u-student",
    tutorId: "t1",
    subjectId: "mate",
    start: isoAt(-14, 18),
    durationMinutes: 90,
    status: "finalizata",
    topics: ["Combinatorică", "Probabilități clasice"],
    notes: "Progres bun la combinatorică. Rămâne de exersat probabilitatea condiționată.",
    materials: [],
    homework: [homework[1]],
    recording: {
      id: "rec2",
      lessonId: "l2",
      consentStudent: false,
      consentTutor: true,
      status: "indisponibila",
    },
  },
  {
    id: "l3",
    bookingId: "b1",
    studentId: "u-student",
    tutorId: "t1",
    subjectId: "mate",
    start: isoAt(0, 18),
    durationMinutes: 90,
    status: "programata",
    topics: ["Șiruri și limite"],
    materials: [],
    homework: [],
  },
];

export function lessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function lessonForBooking(bookingId: string): Lesson | undefined {
  return lessons.find((l) => l.bookingId === bookingId);
}

export const progress: ProgressEntry[] = [
  {
    id: "pg1",
    studentId: "u-student",
    subjectId: "mate",
    date: isoAt(-60, 10),
    score: 5.8,
    label: "Test inițial",
  },
  {
    id: "pg2",
    studentId: "u-student",
    subjectId: "mate",
    date: isoAt(-40, 10),
    score: 6.4,
    label: "Simulare școală",
  },
  {
    id: "pg3",
    studentId: "u-student",
    subjectId: "mate",
    date: isoAt(-20, 10),
    score: 7.1,
    label: "Variantă 42",
  },
  {
    id: "pg4",
    studentId: "u-student",
    subjectId: "mate",
    date: isoAt(-7, 10),
    score: 7.6,
    label: "Variantă 58",
  },
];

export const favoriteTutorIds = ["t1", "t5"];

export const conversations: Conversation[] = [
  {
    id: "c1",
    studentId: "u-student",
    tutorId: "t1",
    lastMessageAt: isoAt(-1, 20),
    messages: [
      {
        id: "msg1",
        conversationId: "c1",
        authorId: "u-student",
        text: "Bună ziua! Putem relua integralele marți?",
        sentAt: isoAt(-2, 19),
      },
      {
        id: "msg2",
        conversationId: "c1",
        authorId: "u-t1",
        text: "Sigur, pregătesc o fișă cu 10 exerciții.",
        sentAt: isoAt(-1, 20),
      },
    ],
  },
];

/** Elevii tutorelui demo (folosit în dashboardul de profesor). */
export const tutorStudents = [
  {
    id: "u-student",
    name: "Andrei Popescu",
    subjectId: "mate",
    goal: "Bac M1 · țintă 8.50",
    lastScore: 7.6,
    lessons: 8,
  },
  {
    id: "st-2",
    name: "Maria Dumitru",
    subjectId: "mate",
    goal: "Evaluare Națională",
    lastScore: 8.4,
    lessons: 12,
  },
  {
    id: "st-3",
    name: "Ștefan Pop",
    subjectId: "mate",
    goal: "Admitere Politehnica",
    lastScore: 6.9,
    lessons: 5,
  },
  {
    id: "st-4",
    name: "Alexandra Marin",
    subjectId: "mate",
    goal: "Bac M2",
    lastScore: 7.2,
    lessons: 3,
  },
];
