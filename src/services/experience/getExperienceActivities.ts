import { supabase } from "@/src/lib/supabase";
import { ExperienceActivity } from "@/src/types/experienceActivity";


export const getExperienceActivities = async (experienceId: number) => {
  const { data, error } = await supabase
    .from("experience_activities")
    .select("*")
    .eq("experience_id", experienceId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Fetch activities failed:", error);
  }

  return (data as ExperienceActivity[]) || [];
};