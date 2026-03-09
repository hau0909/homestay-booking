import { supabase } from "@/src/lib/supabase";

export async function uploadListingImageForEdit(file: File) {
  const fileName = `listing/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("listing_images")
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("listing_images")
    .getPublicUrl(fileName);

  return data.publicUrl;
}