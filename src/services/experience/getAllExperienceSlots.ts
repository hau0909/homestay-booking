import { supabase } from "@/src/lib/supabase";
import { ExperienceSlot } from "@/src/types/experienceSlot";

export const getAllExperienceSlots = async (experienceId: number) => {
  const { data, error } = await supabase
    .from("experience_slots")
    .select("*")
    .eq("experience_id", experienceId)
    .order("start_time");

  if (error) {
    console.error("Fetch experience slots failed:", error);
  }

  return (data as ExperienceSlot[]) || [];
};