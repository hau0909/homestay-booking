import { supabase } from "@/src/lib/supabase";
import { getUser } from "@/src/services/profile/getUserProfile";
import { Booking } from "@/src/types/booking";

export async function getBookingById(
  bookingId: string | number,
): Promise<Booking> {
  const { user } = await getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", Number(bookingId))
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Get booking error:", error);
    throw new Error(error.message || "Failed to fetch booking. Might be RLS or invalid ID.");
  }

  return data as Booking;
}
