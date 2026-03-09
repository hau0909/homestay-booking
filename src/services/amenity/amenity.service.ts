import { supabase } from "@/src/lib/supabase";
import { Amenity } from "@/src/types/amenity";
import { AmenityType } from "@/src/types/enums";

export async function getAmenities(typeFilter?: AmenityType): Promise<Amenity[]> {
  try {
    let query = supabase
      .from("amenities")
      .select("id, name, icon_url, type");

    if (typeFilter) {
      query = query.in("type", [typeFilter, "BOTH"]);
    }

    const { data, error, status, statusText } = await query;

    console.log("Supabase response status:", status, statusText);
    
    if (error) {
      console.error("Error fetching amenities:", error);
      return [];
    }

    console.log("Fetched amenities from DB:", data);
    console.log("Total amenities count:", data?.length);
    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching amenities:", err);
    return [];
  }
}
