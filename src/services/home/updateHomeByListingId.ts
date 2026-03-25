import { supabase } from "@/src/lib/supabase";
import { Home } from "@/src/types/home";

export const updateHomeByListingId = async (
  listingId: number,
  updates: Partial<Home>
): Promise<void> => {
  const { error } = await supabase
    .from("homes")
    .update(updates)
    .eq("listing_id", listingId);
  if (error) throw error;
};
