import { supabase } from "@/src/lib/supabase";

/**
 * Thay thế 1 ảnh listing: upload ảnh mới, cập nhật DB, xóa ảnh cũ khỏi storage và DB
 * @param listingId
 * @param oldImageId
 * @param oldImageUrl
 * @param newFile
 */
export async function replaceListingImage(
  listingId: number,
  oldImageId: number,
  oldImageUrl: string,
  newFile: File
) {
  // 1. Upload ảnh mới
  const path = `${listingId}/${Date.now()}-${newFile.name}`;
  const { error: uploadError } = await supabase.storage
    .from("listing_images")
    .upload(path, newFile);
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("listing_images").getPublicUrl(path);
  const newUrl = data.publicUrl;

  // 2. Insert ảnh mới vào DB
  const { data: inserted, error: insertError } = await supabase
    .from("listing_images")
    .insert([
      {
        listing_id: listingId,
        url: newUrl,
        is_thumbnail: false,
      },
    ])
    .select();
  if (insertError) throw insertError;

  // 3. Xóa ảnh cũ khỏi storage và DB
  // Xóa DB
  await supabase.from("listing_images").delete().eq("id", oldImageId);
  // Xóa storage
  const parts = oldImageUrl.split("/listing_images/");
  if (parts.length > 1) {
    await supabase.storage.from("listing_images").remove([parts[1]]);
  }

  return inserted?.[0];
}
