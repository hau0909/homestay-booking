import { supabase } from "@/src/lib/supabase";
import { Amenity } from "@/src/types/amenity";

export async function getAmenities(): Promise<Amenity[]> {
  const { data, error } = await supabase
    .from("amenities")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}
