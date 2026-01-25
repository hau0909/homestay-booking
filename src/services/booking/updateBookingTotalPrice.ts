import { supabase } from "@/src/lib/supabase";
import { Booking } from "@/src/types/booking";
import { getUser } from "../profile/getUserProfile";

type UpdateBookingPricePayload = {
  booking_id: number;
  total_price: number;
};

export async function updateBookingTotalPrice(
  payload: UpdateBookingPricePayload,
): Promise<Booking> {
  const { user } = await getUser();
  if (!user) throw new Error("User not authenticated");

  if (payload.total_price < 0) {
    throw new Error("Invalid total price");
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({
      total_price: payload.total_price,
    })
    .eq("id", payload.booking_id)
    .eq("user_id", user.id) // 🔒 owner only
    .eq("status", "DRAFT") // 🔒 only draft
    .select()
    .single();

  if (error) {
    console.error("Update booking total price error:", error);
    throw new Error("Failed to update booking total price");
  }

  return data as Booking;
}
