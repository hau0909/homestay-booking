import { supabase } from "@/src/lib/supabase";
import { Listing } from "@/src/types/listing";

export const getListingById = async (listingId: string): Promise<Listing> => {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", Number(listingId))
    .eq("status", "ACTIVE")
    .single();

  if (error) {
    throw new Error("Failed to fetch listing");
  }

  return data as Listing;
};
