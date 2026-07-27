const tutorProfileMap: Record<string, string> = {
  t1: "1c0bb5ac-b395-4ad8-97da-d1a0df0fd5d3",
};

export function profileIdForTutor(tutorId: string): string | null {
  return tutorProfileMap[tutorId] ?? null;
}
