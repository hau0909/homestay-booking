import { supabase } from "@/src/lib/supabase";
import { Experience } from "@/src/types/experience";

export async function createExperience(data: Partial<Experience>) {
  const { data: experience, error } = await supabase
    .from("experiences")
    .insert({
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return experience as Experience;
}
