import { supabase } from "@/src/lib/supabase";

export async function publishListing(listingId: number) {
  const { error } = await supabase
    .from("listings")
    .update({ status: "PENDING" })
    .eq("id", listingId);

  if (error) throw error;
}
