import { supabase } from "@/src/lib/supabase";

export async function getCalendarStatus(
  listingId: number,
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("calendar")
    .select("date, available_count, is_block")
    .eq("listing_id", listingId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) throw error;

  const blockedDates: Date[] = [];
  const limitedDates: Date[] = [];

  for (const item of data ?? []) {
    const dateObj = new Date(item.date);

    if (item.is_block) {
      blockedDates.push(dateObj);
    } else if (item.available_count <= 0) {
      limitedDates.push(dateObj);
    }
  }

  return {
    blockedDates,
    limitedDates,
  };
}
