import { supabase } from "@/src/lib/supabase";
import { Booking } from "@/src/types/booking";

export const getBookingByMonth = async (
  listingId: number,
  month: number,
  year: number,
) => {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
    lastDay,
  ).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("listing_id", listingId)
    .in("status", ["PENDING", "CONFIRMED"])
    .or(`and(check_in_date.lte.${endDate},check_out_date.gte.${startDate})`);

  if (error) {
    console.error("getBookingByMonth error:", error);
    return [];
  }

  return data as Booking[];
};
