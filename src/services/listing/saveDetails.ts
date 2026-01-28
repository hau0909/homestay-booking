import { supabase } from "@/src/lib/supabase";
import type { Home } from "@/src/types/home";

export async function saveDetails(
  listingId: number,
  home: Omit<Home, "listing_id">
) {
  const { error } = await supabase.from("homes").insert({
    ...home,
    listing_id: listingId,
  });

  if (error) throw error;
}
