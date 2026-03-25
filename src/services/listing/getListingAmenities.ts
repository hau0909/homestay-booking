import { supabase } from "@/src/lib/supabase";

export async function getListingAmenities(listingId: number): Promise<number[]> {
  const { data, error } = await supabase
    .from("listing_amenities")
    .select("amenity_id")
    .eq("listing_id", listingId);
  if (error) throw error;
  return data ? data.map((item: any) => item.amenity_id) : [];
}
