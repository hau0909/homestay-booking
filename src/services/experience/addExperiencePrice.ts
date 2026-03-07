import { supabase } from "@/src/lib/supabase";
import { Experience } from "@/src/types/experience";

export async function addExperiencePrice(
  id: number,
  updates: Partial<Experience>,
) {
  const { error } = await supabase
    .from("experiences")
    .update(updates)
    .eq("id", id);

  if (error) throw error;

  return true;
}
