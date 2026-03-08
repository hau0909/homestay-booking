import { supabase } from "@/src/lib/supabase";
import { Experience } from "@/src/types/experience";

export const getExperience = async (listingId: number) => {
  const { data: expData, error: expError } = await supabase
    .from("experiences")
    .select("*")
    .eq("listing_id", listingId)
    .maybeSingle();

  if (expError && expError.code !== "PGRST116") {
    console.error("Fetch experience failed:", expError);
  }

  return expData as Experience | null;
};
