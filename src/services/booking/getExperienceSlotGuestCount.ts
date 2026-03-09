import { supabase } from "@/src/lib/supabase";

export async function getExperienceSlotGuestCount(
  slotId: number,
  date: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("bookings")
    .select("total_guests")
    .eq("experience_slot_id", slotId)
    .eq("check_in_date", date)
    .not("status", "eq", "CANCELLED")
    .not("status", "eq", "DRAFT");

  if (error) {
    console.error("Error fetching slot guest count:", error);
    return 0;
  }

  if (!data || data.length === 0) return 0;

  return data.reduce((sum, booking) => sum + (booking.total_guests || 0), 0);
}
