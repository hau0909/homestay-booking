import { supabase } from "@/src/lib/supabase";
import { ExperienceActivity } from "@/src/types/experienceActivity";

export async function getExperienceActivitiesByListingId(listingId: string | number): Promise<ExperienceActivity[]> {
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

  // Next, find all activities for this experience
  const { data: activities, error: activitiesError } = await supabase
    .from("experience_activities")
    .select("*")
    .eq("experience_id", exp.id)
    .order("sort_order", { ascending: true });

  if (activitiesError) {
    console.error("Error fetching experience activities:", activitiesError);
    return [];
  }

  return activities || [];
}
