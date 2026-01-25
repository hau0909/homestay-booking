import { supabase } from "@/src/lib/supabase";
import { BookingStatus, PaymentStatus } from "@/src/types/enums";
import { Booking } from "@/src/types/booking";
import { getUser } from "../profile/getUserProfile";

export async function createDraftBooking(listing_id: number): Promise<Booking> {
  // Get user
  const { user } = await getUser();
  if (!user) throw new Error("User not authenticated");

  // Check existing DRAFT booking
  const { data: existingBooking, error: checkError } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .eq("listing_id", listing_id)
    .eq("status", "DRAFT")
    .maybeSingle(); // 👈 QUAN TRỌNG

  if (checkError) {
    console.error("Check draft booking error:", checkError);
    throw new Error("Failed to check draft booking");
  }

  // Nếu đã có → return luôn
  if (existingBooking) {
    return existingBooking as Booking;
  }

  //  Chưa có → create mới
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      listing_id,
      status: "DRAFT" as BookingStatus,
      payment_status: "UNPAID" as PaymentStatus,
      total_price: 1,
    })
    .select()
    .single();

  if (error) {
    console.error("Create draft booking error:", error);
    throw new Error("Failed to create draft booking");
  }

  return data as Booking;
}
