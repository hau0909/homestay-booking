import { supabase } from "@/src/lib/supabase";
import { Booking } from "@/src/types/booking";
import { getUser } from "../profile/getUserProfile";

type UpdateBookingNotePayload = {
  booking_id: number;
  note: string;
};

export async function updateBookingNote(
  payload: UpdateBookingNotePayload,
): Promise<Booking> {
  const { user } = await getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("bookings")
    .update({
      note: payload.note,
    })
    .eq("id", payload.booking_id)
    .eq("user_id", user.id) // 🔒 owner only
    .eq("status", "DRAFT") // 🔒 chỉ cho draft
    .select()
    .single();

  if (error) {
    console.error("Update booking note error:", error);
    throw new Error("Failed to update booking note");
  }

  return data as Booking;
}
