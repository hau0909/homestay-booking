import { supabase } from "@/src/lib/supabase";

export async function uploadListingImages(
  listingId: number,
  images: File[]
) {
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
