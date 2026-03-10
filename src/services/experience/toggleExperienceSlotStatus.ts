import { supabase } from "@/src/lib/supabase";

export const toggleExperienceSlotStatus = async (
  slotId: number,
  currentStatus: boolean
) => {
  const { error } = await supabase
    .from("experience_slots")
    .update({
      is_active: !currentStatus,
    })
    .eq("id", slotId);

  if (error) {
    console.error("Toggle slot failed:", error);
    return false;
  }

  return true;
};