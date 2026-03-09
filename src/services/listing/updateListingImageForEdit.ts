import { supabase } from "@/src/lib/supabase";

export async function updateListingImageForEdit(
  imageId: number,
  newUrl: string
) {
  const { error } = await supabase
    .from("listing_images")
    .update({ url: newUrl })
    .eq("id", imageId);

  if (error) throw error;
}