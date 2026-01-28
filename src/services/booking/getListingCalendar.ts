import { supabase } from "@/src/lib/supabase";

export async function getListingCalendar(listingId: number) {
  const { data, error } = await supabase
    .from("calendar")
    .select("*")
    .eq("listing_id", listingId);

  if (error) throw error;
  return data;
}
