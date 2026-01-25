import { supabase } from "@/src/lib/supabase";
import { Booking } from "@/src/types/booking";
import { getUser } from "../profile/getUserProfile";

export async function getUserBookings(): Promise<Booking[]> {
  const { user } = await getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getBookingsByUser error:", error);
    throw error;
  }

  return data as Booking[];
}
