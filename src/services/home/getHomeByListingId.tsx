import { supabase } from "@/src/lib/supabase";
import { Home } from "@/src/types/home";

export const getHomeByListingId = async (
  listingId: string,
): Promise<Home | null> => {
  const { data, error } = await supabase
    .from("homes")
    .select("*")
    .eq("listing_id", listingId)
    .maybeSingle();

  if (error) {
    console.error("getHomeByListingId error:", error);
    throw error;
  }

  return data as Home;
};
