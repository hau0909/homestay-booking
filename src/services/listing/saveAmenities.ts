import { supabase } from "@/src/lib/supabase";

export async function saveAmenities(
  listingId: number,
  amenityIds: number[]
) {
  if (!amenityIds.length) return;

  const payload = amenityIds.map((amenity_id) => ({
    listing_id: listingId,
    amenity_id,
  }));

  const { error } = await supabase
    .from("listing_amenities")
    .insert(payload);

  if (error) throw error;
}
