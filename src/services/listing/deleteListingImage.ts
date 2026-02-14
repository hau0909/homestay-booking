// trietcmce180982_sprint2
import { supabase } from "@/src/lib/supabase";

// Xóa ảnh khỏi storage và database
export async function deleteListingImage(imageId: number, imageUrl: string) {
  // Xóa file khỏi storage
  // Lấy path từ publicUrl
  const url = new URL(imageUrl);
  const path = decodeURIComponent(url.pathname.replace(/^\/storage\/v1\/object\/public\/listing_images\//, ""));
  const { error: storageError } = await supabase.storage.from("listing_images").remove([path]);
  if (storageError) throw storageError;

  // Xóa record khỏi database
  const { error: dbError } = await supabase
    .from("listing_images")
    .delete()
    .eq("id", imageId);
  if (dbError) throw dbError;
  return true;
}
