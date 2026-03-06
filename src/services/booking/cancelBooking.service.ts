import { supabase } from "@/src/lib/supabase";

export const cancelBooking = async (
  userId: string,
  bookingId: number,
  reason: string,
) => {
  const { data: existingBooking, error } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .single();

  if (error || !existingBooking) {
    throw new Error("Booking not found");
  }

  if (existingBooking.status !== "PENDING") {
    throw new Error("Only pending bookings can be cancelled");
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "CANCELLED" })
    .eq("id", bookingId)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: reasonError } = await supabase
    .from("cancelled_reasons")
    .insert({
      booking_id: bookingId,
      cancelled_by: userId,
      reason,
    });

  if (reasonError) {
    throw new Error(reasonError.message);
  }

  return true;
};
