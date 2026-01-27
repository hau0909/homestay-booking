import { supabase } from "@/src/lib/supabase";
import { Listing } from "@/src/types/listing";

export async function updateListing(id: number, updates: Partial<Listing>) {
  const { error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
  return true;
}
