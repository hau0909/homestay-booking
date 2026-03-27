import { supabase } from "@/src/lib/supabase";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import { ListingImage } from "@/src/types/listingImages";

interface AddActivityResult {
  updatedActivities: ExperienceActivity[];
  newImage?: ListingImage;
}

export async function addExperienceActivitiesKeepOld(
  listingId: number,
  experienceId: number,
  newActivity: Omit<ExperienceActivity, "id">,
  file?: File
): Promise<AddActivityResult> {
  let imageUrl = newActivity.image_url || null;
  let newImage: ListingImage | undefined = undefined;

  // 1️⃣ Upload file activity nếu có
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

    // Tạo luôn ListingImage mới trên DB
    const { data: imgData, error: imgError } = await supabase
      .from("listing_images")
      .insert([
        {
          listing_id: listingId,
          url: imageUrl,
          is_thumbnail: false,
        },
      ])
      .select()
      .single();

    if (imgError) throw imgError;

    newImage = imgData;
  }

  // 2️⃣ Insert activity mới
  const { error: insertError } = await supabase
    .from("experience_activities")
    .insert([
      {
        experience_id: experienceId,
        title: newActivity.title,
        description: newActivity.description || null,
        sort_order: newActivity.sort_order,
        image_url: imageUrl,
        created_at: newActivity.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

  if (insertError) throw insertError;

  // 3️⃣ Lấy toàn bộ activity hiện tại (cả cũ + mới)
  const { data: allActivities, error: fetchError } = await supabase
    .from("experience_activities")
    .select("*")
    .eq("experience_id", experienceId)
    .order("sort_order", { ascending: true });

  if (fetchError) throw fetchError;

  return { updatedActivities: allActivities, newImage };
}