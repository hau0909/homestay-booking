import { supabase } from "@/src/lib/supabase";

export async function saveLocation(
  listingId: number,
  location: {
    province_code: string;
    district_code: string;
    ward_code: string;
    address_detail: string;
  }
) {
  const { error } = await supabase
    .from("listings")
    .update(location)
    .eq("id", listingId);

  if (error) throw error;
}
