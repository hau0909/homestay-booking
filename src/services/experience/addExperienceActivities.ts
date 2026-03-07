import { supabase } from "@/src/lib/supabase";
import { ExperienceActivity } from "@/src/types/experienceActivity";

export async function addExperienceActivities(
  experienceId: number,
  activities: ExperienceActivity[],
  activityFiles: Record<number, File>,
) {
  const formattedActivities = await Promise.all(
    activities.map(async (activity) => {
      const file = activityFiles[activity.id];

      let imageUrl = activity.image_url;

      if (file) {
        const filePath = `${experienceId}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("experience_activity_images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("experience_activity_images")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      return {
        experience_id: experienceId,
        image_url: imageUrl,
        title: activity.title,
        description: activity.description,
        sort_order: activity.sort_order,
      };
    }),
  );

  // 1. Delete existing activities for this experience to prevent duplicates on back & next
  const { error: deleteError } = await supabase
    .from("experience_activities")
    .delete()
    .eq("experience_id", experienceId);

  if (deleteError) throw deleteError;

  // 2. Insert the fresh list
  const { data, error } = await supabase
    .from("experience_activities")
    .insert(formattedActivities)
    .select();

  if (error) throw error;

  return data;
}
