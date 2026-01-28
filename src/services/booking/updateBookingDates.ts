import { supabase } from "@/src/lib/supabase";
import { Booking } from "@/src/types/booking";
import { getUser } from "../profile/getUserProfile";

type UpdateBookingDatesPayload = {
  booking_id: number;
  check_in_date: string; // ISO: yyyy-mm-dd
  check_out_date: string; // ISO: yyyy-mm-dd
};

export async function updateBookingDates(
  payload: UpdateBookingDatesPayload,
): Promise<Booking> {
  const { user } = await getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("bookings")
    .update({
      check_in_date: payload.check_in_date,
      check_out_date: payload.check_out_date,
    })
    .eq("id", payload.booking_id)
    .eq("user_id", user.id)
    .eq("status", "DRAFT")
    .select()
    .single();

  if (error) {
    console.error("Update booking dates error:", error);
    throw new Error("Failed to update booking dates");
  }

  return data as Booking;
}
