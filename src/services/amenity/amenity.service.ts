import { supabase } from "@/src/lib/supabase";
import { Amenity } from "@/src/types/amenity";

export async function getAmenities(): Promise<Amenity[]> {
  try {
    const { data, error, status, statusText } = await supabase
      .from("amenities")
      .select("id, name, icon_url, type");

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
