/**
 * Medito – domain model.
 *
 * These types are the single source of truth for the demo data layer and are
 * intentionally shaped so they can be mapped 1:1 onto Postgres tables when
 * Lovable Cloud (Supabase) is enabled later. Nothing here depends on the UI.
 */

export type UserRole = "student" | "tutor" | "admin" | "parent"; // `parent` reserved for a later release

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  avatarUrl?: string;
  city?: string;
  createdAt: string;
}

export type SchoolLevel = "gimnaziu" | "liceu" | "facultate" | "adult";

export type ExamGoal =
  | "bacalaureat"
  | "evaluare-nationala"
  | "admitere-facultate"
  | "examen-facultate"
  | "certificare-limba"
  | "sprijin-scolar";

export type LessonFormat = "online" | "in-persoana" | "ambele";

export interface Subject {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  /** Broad grouping used on the landing page */
  group: "stiinte" | "umaniste" | "limbi" | "examene" | "it";
}

export interface TimeWindow {
  /** 1 = luni ... 7 = duminică */
  day: number;
  from: string; // "18:00"
  to: string; // "21:00"
}

export interface StudentProfile {
  id: string;
  userId: string;
  level: SchoolLevel;
  grade?: string; // "clasa a XII-a"
  subjectIds: string[];
  currentScore?: number; // ex. 6.4 la simulare
  targetScore?: number; // ex. 8.5
  goal: ExamGoal;
  desiredOutcome?: string;
  format: LessonFormat;
  city?: string;
  budgetMin: number;
  budgetMax: number;
  lessonDuration: 50 | 60 | 90 | 120;
  availability: TimeWindow[];
}

export interface Qualification {
  id: string;
  title: string;
  issuer: string;
  year: number;
  /** Verificarea documentelor se face manual de echipa Medito. */
  verified: boolean;
}

export interface TutorSubject {
  subjectId: string;
  levels: SchoolLevel[];
  exams: ExamGoal[];
  pricePerSession: number; // RON
}

export interface TutorProfile {
  id: string;
  userId: string;
  headline: string;
  intro: string;
  approach: string;
  city: string;
  format: LessonFormat;
  yearsExperience: number;
  subjects: TutorSubject[];
  qualifications: Qualification[];
  lessonDurations: Array<50 | 60 | 90 | 120>;
  pricePerSession: number;
  rating: number;
  reviewCount: number;
  studentsTaught: number;
  verified: boolean;
  /** Placeholder – se va încărca în storage la integrarea backendului. */
  introVideoUrl?: string;
  /** Pregătit pentru grupe mici (nefuncțional în MVP). */
  offersGroupLessons: boolean;
  responseTimeMinutes: number;
  availability: TimeWindow[];
  profileCompletion: number;
}

export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  start: string; // ISO
  durationMinutes: number;
  format: Exclude<LessonFormat, "ambele">;
  booked: boolean;
}

export type BookingStatus =
  "in-asteptare" | "confirmata" | "reprogramata" | "anulata" | "finalizata";

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  slotId: string;
  subjectId: string;
  topic: string;
  start: string;
  durationMinutes: number;
  format: Exclude<LessonFormat, "ambele">;
  price: number;
  status: BookingStatus;
  /** Rezervat pentru grupe mici; în MVP este mereu 1. */
  seats: number;
  createdAt: string;
}

export type PaymentStatus = "neplatita" | "in-procesare" | "platita" | "rambursata";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: "RON";
  status: PaymentStatus;
  /** Se va popula de Stripe la integrare. */
  providerRef?: string;
  method: "card" | "transfer";
}

export interface Material {
  id: string;
  lessonId: string;
  name: string;
  type: "pdf" | "doc" | "link" | "imagine";
  sizeLabel?: string;
  url?: string;
}

export interface Homework {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "de-facut" | "trimisa" | "corectata";
}

export interface Recording {
  id: string;
  lessonId: string;
  /** Se activează doar cu acordul ambilor participanți. */
  consentStudent: boolean;
  consentTutor: boolean;
  status: "indisponibila" | "in-procesare" | "disponibila";
  url?: string;
  durationMinutes?: number;
}

export interface ProgressEntry {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  score: number;
  label: string;
}

export interface Lesson {
  id: string;
  bookingId: string;
  studentId: string;
  tutorId: string;
  subjectId: string;
  start: string;
  durationMinutes: number;
  status: "programata" | "in-desfasurare" | "finalizata";
  topics: string[];
  notes?: string;
  materials: Material[];
  homework: Homework[];
  recording?: Recording;
}

export interface Review {
  id: string;
  tutorId: string;
  studentName: string;
  rating: number;
  date: string;
  text: string;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  text: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  studentId: string;
  tutorId: string;
  lastMessageAt: string;
  messages: Message[];
}

/** Rezultatul logicii de potrivire (determinist, fără AI). */
export interface MatchResult {
  tutor: TutorProfile;
  user: User;
  score: number;
  reasons: string[];
}
