import { supabase } from "@/src/lib/supabase";
import { Booking } from "@/src/types/booking";
import { getUser } from "../profile/getUserProfile";
import { BookingStatus } from "@/src/types/enums";

export async function confirmBooking(booking_id: number): Promise<Booking> {
  const { user } = await getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "PENDING" as BookingStatus,
    })
    .eq("id", booking_id)
    .eq("user_id", user.id) // 🔒 owner
    .eq("status", "DRAFT") // 🔒 chỉ từ draft
    .select()
    .single();

  if (error) {
    console.error("Confirm booking error:", error);
    throw new Error("Failed to confirm booking");
  }

  return data as Booking;
}
