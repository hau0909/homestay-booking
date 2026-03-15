// trietcmce180982_sprint3
import { supabase } from "@/src/lib/supabase";

export async function getCustomerExperienceBookings(userId: string) {
  // Lấy tất cả booking experience của user, join experience_slots, rồi join experiences và listings
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      experience_slot_id,
      status,
      total_price,
      total_guests,
      experience_slots(id, start_time, end_time, experience_id, experiences(id, title, listing_id, listings(id, title)))
    `)
    .eq("user_id", userId)
    .not("experience_slot_id", "is", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return bookings || [];
}
