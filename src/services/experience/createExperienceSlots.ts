import { supabase } from "@/src/lib/supabase";
import { ExperienceSlot } from "@/src/types/experienceSlot";

export async function createExperienceSlots(slots: Partial<ExperienceSlot>[]) {
  const { data, error } = await supabase
    .from("experience_slots")
    .insert(slots)
    .select();

  if (error) throw error;

  return data as ExperienceSlot[];
}
