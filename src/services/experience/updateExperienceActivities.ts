import { supabase } from "@/src/lib/supabase";
import { ExperienceActivity } from "@/src/types/experienceActivity";

export async function updateExperienceActivities(
  experienceId: number,
  activities: ExperienceActivity[],
  activityFiles: Record<number, File>
) {
  if (!experienceId) throw new Error("Invalid experienceId");

  const updatedActivities = await Promise.all(
    activities.map(async (activity) => {
      let imageUrl = activity.image_url;
      const file = activityFiles[activity.id];

      if (file) {
        // ---------- 1. Upload ảnh mới ----------
        const safeName = file.name
          .replace(/\s/g, "_")
          .replace(/[^a-zA-Z0-9_\-\.]/g, "");

        const filePath = `${experienceId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("experience_activity_images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("experience_activity_images")
          .getPublicUrl(filePath);

        const newUrl = data.publicUrl;

        // ---------- 2. Xóa ảnh cũ ----------
        if (activity.image_url) {
          try {
            const oldPath = activity.image_url.split(
              "/storage/v1/object/public/experience_activity_images/"
            )[1];

            if (oldPath) {
              await supabase.storage
                .from("experience_activity_images")
                .remove([oldPath]);
            }

          } catch (err) {
            console.error("Delete old image error:", err);
          }
        }

        imageUrl = newUrl;

        // ---------- 3. Cập nhật lại record ở listing_images ----------
        let updated = false;
        if (activity.image_url) {
          // a. Thử exact match trước
          const { data: updatedImgs } = await supabase
            .from("listing_images")
            .update({ url: newUrl })
            .eq("listing_id", experienceId)
            .eq("url", activity.image_url)
            .select();

          if (updatedImgs && updatedImgs.length > 0) {
            updated = true;
          } else {
            // b. Nếu không khớp (ảnh lúc tạo ở bucket listing_images), tìm theo tên file gốc
            const filenameSegment = decodeURIComponent(activity.image_url.split('/').pop() || "");
            const nameParts = filenameSegment.split('-');

            if (nameParts.length >= 3) {
              const originalName = nameParts.slice(2).join('-');

              const { data: searchImgs } = await supabase
                .from("listing_images")
                .select("id, url")
                .eq("listing_id", experienceId)
                .ilike("url", `%-${originalName}`);

              if (searchImgs && searchImgs.length > 0) {
                // Cập nhật record tìm thấy
                const { data: updatedWildcard } = await supabase
                  .from("listing_images")
                  .update({ url: newUrl })
                  .eq("id", searchImgs[0].id)
                  .select();

                if (updatedWildcard && updatedWildcard.length > 0) {
                  updated = true;
                  // Xóa file thừa bên listing_images
                  try {
                    const oldListingPath = searchImgs[0].url.split("/storage/v1/object/public/listing_images/")[1];
                    if (oldListingPath) {
                      await supabase.storage.from("listing_images").remove([oldListingPath]);
                    }
                  } catch (e) {
                    console.error("Clean old listing image failed", e);
                  }
                }
              }
            }
          }
        }

        if (!updated) {
          await supabase.from("listing_images").insert([
            {
              listing_id: experienceId,
              url: newUrl,
              is_thumbnail: false,
            },
          ]);
        }
      }

      // ---------- 4. Update activity ----------
      const { data, error } = await supabase
        .from("experience_activities")
        .update({
          title: activity.title,
          description: activity.description,
          image_url: imageUrl,
          sort_order: activity.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activity.id)
        .select()
        .single();

      if (error) throw error;

      return data as ExperienceActivity;
    })
  );

  return updatedActivities;
}