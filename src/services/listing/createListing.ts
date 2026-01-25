import { supabase } from "@/src/lib/supabase";
import type { Listing } from "@/src/types/listing";
import type { Home } from "@/src/types/home";

export type CreateListingPayload = {
  listing: Omit<Listing, "id" | "created_at" | "updated_at">;
  home: Omit<Home, "listing_id">;
  images: File[];
};

export async function createListing(payload: CreateListingPayload) {
  /* ===== 1. INSERT LISTING ===== */
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert(payload.listing)
    .select()
    .single();

  if (listingError) throw listingError;

  /* ===== 2. INSERT HOME ===== */
  const { error: homeError } = await supabase.from("homes").insert({
    ...payload.home,
    listing_id: listing.id,
  });

  if (homeError) throw homeError;

  /* ===== 3. UPLOAD IMAGES ===== */
  const imageRows: {
    listing_id: number;
    url: string;
    is_thumbnail: boolean;
  }[] = [];

  for (let i = 0; i < payload.images.length; i++) {
    const file = payload.images[i];
    const path = `${listing.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("listing_images") // ✅ ĐÃ SỬA Ở ĐÂY
      .upload(path, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("listing_images") // ✅ VÀ Ở ĐÂY
      .getPublicUrl(path);

    imageRows.push({
      listing_id: listing.id,
      url: data.publicUrl,
      is_thumbnail: i === 0,
    });
  }

  /* ===== 4. INSERT IMAGE RECORDS ===== */
  if (imageRows.length > 0) {
    const { error: imageError } = await supabase
      .from("listing_images")
      .insert(imageRows);

    if (imageError) throw imageError;
  }

  return listing;
}

/* ===== PUBLISH ===== */
export async function publishListing(listingId: number) {
  const { error } = await supabase
    .from("listings")
    .update({ status: "ACTIVE" })
    .eq("id", listingId);

  if (error) throw error;
}
