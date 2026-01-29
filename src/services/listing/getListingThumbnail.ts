import { supabase } from "@/src/lib/supabase";
import { ListingImage } from "@/src/types/listingImages";

export const getListingThumbnail = async (
  listingId: number,
): Promise<ListingImage | null> => {
  const { data, error } = await supabase
    .from("listing_images")
    .select("*")
    .eq("listing_id", listingId)
    .eq("is_thumbnail", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getListingThumbnail error:", error);
    throw new Error("Failed to fetch listing thumbnail");
  }

  return data as ListingImage;
};
