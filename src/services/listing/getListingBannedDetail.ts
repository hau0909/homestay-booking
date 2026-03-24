import { supabase } from "@/src/lib/supabase";
import { ListingBannedDetail } from "@/src/types/ListingBannedDetail";

export async function getListingBannedDetail(
  listingId: number
): Promise<ListingBannedDetail | null> {
  try {
    const { data, error } = await supabase
      .from("listing_banned_detail")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false })
      .maybeSingle();

    // Log chỉ khi error thực sự, không phải "no row"
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching banned detail:", error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error("Unexpected error fetching banned detail:", err);
    return null;
  }
}