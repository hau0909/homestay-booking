import { supabase } from "@/src/lib/supabase";
import { Home } from "@/src/types/home";

export const getHomeByListingId = async (
  listingId: string,
): Promise<Home | null> => {
  // Convert to number since listing_id in homes table is int4
  const numericId = Number(listingId);
  
  console.log("getHomeByListingId - listingId:", listingId, "numericId:", numericId);
  
  const { data, error } = await supabase
    .from("homes")
    .select("*")
    .eq("listing_id", numericId)
    .maybeSingle();

  console.log("getHomeByListingId - data:", data, "error:", error);

  if (error) {
    console.error("getHomeByListingId error:", error);
    throw error;
  }

  return data as Home;
};
