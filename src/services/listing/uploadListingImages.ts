import { supabase } from "@/src/lib/supabase";

export async function uploadListingImages(
  listingId: number,
  images: File[]
) {
  // Query old images to delete from storage
  const { data: oldImages } = await supabase
    .from("listing_images")
    .select("url")
    .eq("listing_id", listingId);

  if (oldImages && oldImages.length > 0) {
    // Delete from DB first
    await supabase.from("listing_images").delete().eq("listing_id", listingId);

    // Try to delete from storage. Storage path is listing_images/listingId/filename
    // Or we can just extract from URL
    const pathsToDelete = oldImages
      .map((img) => {
        // e.g., .../public/listing_images/17/1712312-abc.png
        const parts = img.url.split("/listing_images/");
        if (parts.length > 1) {
          return parts[1]; // e.g., "17/1712312-abc.png"
        }
        return null;
      })
      .filter(Boolean) as string[];

    if (pathsToDelete.length > 0) {
      await supabase.storage.from("listing_images").remove(pathsToDelete);
    }
  }

  const rows: {
    listing_id: number;
    url: string;
    is_thumbnail: boolean;
  }[] = [];

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const path = `${listingId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("listing_images")
      .upload(path, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("listing_images")
      .getPublicUrl(path);

    rows.push({
      listing_id: listingId,
      url: data.publicUrl,
      is_thumbnail: i === 0,
    });
  }

  const { error } = await supabase
    .from("listing_images")
    .insert(rows);

  if (error) throw error;
}
