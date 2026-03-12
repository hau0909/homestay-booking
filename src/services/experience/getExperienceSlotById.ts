import { supabase } from "@/src/lib/supabase";
import { ExperienceSlot } from "@/src/types/experienceSlot";

export const getExperienceSlotById = async (slotId: number) => {
  const { data, error } = await supabase
    .from("experience_slots")
    .select("*")
    .eq("id", slotId)
    .single();

  if (error) {
    console.error("Fetch experience slot by id failed:", error);
    return null;
  }

  return data as ExperienceSlot;
};
