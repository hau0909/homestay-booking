import { supabase } from "@/src/lib/supabase";

export async function savePricing(
  listingId: number,
  pricing: {
    price_weekday: number;
    price_weekend: number;
  }
) {
  const { error } = await supabase
    .from("homes")
    .update(pricing)
    .eq("listing_id", listingId);

  if (error) throw error;
}
