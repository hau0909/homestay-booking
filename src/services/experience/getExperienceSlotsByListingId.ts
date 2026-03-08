import { supabase } from "@/src/lib/supabase";
import { ExperienceSlot } from "@/src/types/experienceSlot";

export async function getExperienceSlotsByListingId(listingId: string | number): Promise<ExperienceSlot[]> {
  // First, find the experience associated with this listing
  const { data: exp, error: expError } = await supabase
    .from("experiences")
    .select("id")
    .eq("listing_id", listingId)
    .single();

  if (expError || !exp) {
    if (expError && expError.code !== 'PGRST116') {
      console.error("Error fetching experience for listing:", expError);
    }
    return [];
  }

  // Next, find all active slots for this experience
  const { data: slots, error: slotsError } = await supabase
    .from("experience_slots")
    .select("*")
    .eq("experience_id", exp.id)
    .eq("is_active", true)
    .order("start_time", { ascending: true });

  if (slotsError) {
    console.error("Error fetching experience slots:", slotsError);
    return [];
  }

  return slots || [];
}
