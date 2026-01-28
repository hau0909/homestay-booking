import { supabase } from "@/src/lib/supabase";

export interface ListingImage {
  id: number;
  listing_id: number;
  url: string;
  is_thumbnail: boolean;
  created_at: string;
}

// Lấy ảnh đầu tiên (hoặc ảnh thumbnail) cho mỗi listing
export async function getListingMainImages(listingIds: number[]): Promise<Record<number, string>> {
  if (listingIds.length === 0) return {};
  const { data, error } = await supabase
    .from("listing_images")
    .select("listing_id, url, is_thumbnail")
    .in("listing_id", listingIds);
  if (error) throw error;
  // Ưu tiên ảnh thumbnail, nếu không có thì lấy ảnh đầu tiên
  const imageMap: Record<number, string> = {};
  for (const id of listingIds) {
    const images = (data || []).filter((img) => img.listing_id === id);
    const main = images.find((img) => img.is_thumbnail) || images[0];
    if (main) {
      // Nếu link là demo hoặc không hợp lệ thì thay bằng ảnh mặc định
      let url = main.url;
      if (url.includes("cdn.example.com")) {
        url = "https://placehold.co/400x300?text=No+Image";
      }
      imageMap[id] = url;
    }
  }
  return imageMap;
}
