import { supabase } from "@/lib/supabase/client";

export async function getOrCreateConversation(
  studentId: string,
  tutorId: string,
): Promise<string> {
  const { data: existing, error: lookupError } = await supabase
    .from("conversations")
    .select("id")
    .eq("student_id", studentId)
    .eq("tutor_id", tutorId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      student_id: studentId,
      tutor_id: tutorId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: concurrent, error: concurrentError } =
        await supabase
          .from("conversations")
          .select("id")
          .eq("student_id", studentId)
          .eq("tutor_id", tutorId)
          .single();

      if (concurrentError) throw concurrentError;

      return concurrent.id;
    }

    throw error;
  }

  return data.id;
}
