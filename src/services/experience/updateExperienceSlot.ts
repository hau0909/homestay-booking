import { supabase } from "@/src/lib/supabase";

export const updateExperienceSlot = async (
  slotId: number,
  startTime: string,
  endTime: string,
  maxAttendees: number
) => {
  const { error } = await supabase
    .from("experience_slots")
    .update({
      start_time: startTime,
      end_time: endTime,
      max_attendees: maxAttendees,
    })
    .eq("id", slotId);

  if (error) {
    console.error("Update slot failed:", error);
    return false;
  }

  return true;
};