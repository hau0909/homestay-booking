import { supabase } from "@/src/lib/supabase";
import { ExperienceActivity } from "@/src/types/experienceActivity";

export async function addExperienceActivities(
  experienceId: number,
  activities: ExperienceActivity[],
  activityFiles: Record<number, File>,
) {
  // Upload top 5 listing images from activity images
  const listingImageFiles: File[] = [];
  for (const activity of activities) {
    if (listingImageFiles.length >= 5) break;
    const file = activityFiles[activity.id];
    if (file) {
      listingImageFiles.push(file);
    }
  }

  const listingRows: {
    listing_id: number;
    url: string;
    is_thumbnail: boolean;
  }[] = [];

  for (let i = 0; i < listingImageFiles.length; i++) {
    const file = listingImageFiles[i];
    const path = `${experienceId}/${Date.now()}-${i}-${file.name}`;

    const { error } = await supabase.storage
      .from("listing_images")
      .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("listing_images")
      .getPublicUrl(path);

    listingRows.push({
      listing_id: experienceId,
      url: data.publicUrl,
      is_thumbnail: i === 0,
    });
  }

  if (listingRows.length > 0) {
    // Delete existing listing images for this experience to prevent duplicates on back & next
    const { error: deleteListingImagesError } = await supabase
      .from("listing_images")
      .delete()
      .eq("listing_id", experienceId);

    if (deleteListingImagesError) throw deleteListingImagesError;

    const { error: insertListingImagesError } = await supabase
      .from("listing_images")
      .insert(listingRows);

    if (insertListingImagesError) throw insertListingImagesError;
  }

  const formattedActivities = await Promise.all(
    activities.map(async (activity) => {
      const file = activityFiles[activity.id];

      let imageUrl = activity.image_url;

      if (file) {
        const filePath = `${experienceId}/${Date.now()}-${activity.id}-${file.name}`;

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
