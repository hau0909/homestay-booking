import { supabase } from "@/src/lib/supabase";
import { Listing } from "@/src/types/listing";

export async function createDraftExperienceListing(data: Partial<Listing>) {
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...data,
      status: "DRAFT",
      listing_type: "EXPERIENCE",
    })
    .select()
    .single();

  if (error) throw error;
  return listing as Listing;
}
