import { supabase } from "@/src/lib/supabase";
import { CancelPolicy } from "@/src/types/cancel-policy";

export const getCancelPolicyByListingId = async (
  listingId: number
): Promise<CancelPolicy | null> => {
  const { data, error } = await supabase
    .from("cancel_policy")
    .select("*")
    .eq("listing_id", listingId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // JSON object requested, multiple (or no) rows returned error code
      return null;
    }
    console.error("Failed to fetch cancel policy", error);
    return null;
  }

  return data as CancelPolicy;
};
