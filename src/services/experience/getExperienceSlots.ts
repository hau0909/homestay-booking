import { supabase } from "@/src/lib/supabase";
import { ExperienceSlot } from "@/src/types/experienceSlot";

export const getExperienceSlots = async (experienceId: number) => {
  const { data: slotsData, error: slotError } = await supabase
    .from("experience_slots")
    .select("*")
    .eq("experience_id", experienceId)
    .eq("is_active", true);

  if (slotError) {
    console.error("Fetch experience slots failed:", slotError);
  }

  return (slotsData as ExperienceSlot[]) || [];
};
