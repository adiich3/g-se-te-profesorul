import type { MatchCriteria } from "./matching";

const KEY = "medito:need";

/**
 * Nevoia elevului este păstrată local până la conectarea backendului.
 * La integrarea Lovable Cloud, aceleași câmpuri se salvează în `student_profiles`.
 */
export function saveNeed(need: MatchCriteria) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(need));
}

export function loadNeed(): MatchCriteria | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MatchCriteria) : null;
  } catch {
    return null;
  }
}

export function clearNeed() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
