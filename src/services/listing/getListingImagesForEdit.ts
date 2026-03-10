import { supabase } from "@/src/lib/supabase";
import { ListingImage } from "@/src/types/listingImages";

export async function getListingImagesForEdit(
  listingId: number
): Promise<ListingImage[]> {

  const { data, error } = await supabase
    .from("listing_images")
    .select("id, listing_id, url, caption, is_thumbnail, created_at")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data ?? [];
}