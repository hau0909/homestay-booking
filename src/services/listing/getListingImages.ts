// trietcmce180982_sprint2
import { supabase } from "@/src/lib/supabase";
import { ListingImage } from "@/src/services/listing/getListingMainImages";

export async function getListingImages(listingId: number): Promise<ListingImage[]> {
  const { data, error } = await supabase
    .from("listing_images")
    .select("id, listing_id, url, is_thumbnail, created_at")
    .eq("listing_id", listingId)
    .order("is_thumbnail", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as ListingImage[]) || [];
}
