// trietcmce180982_sprint2
import { supabase } from "@/src/lib/supabase";

export async function getTopRatedListings() {
  // 1. Lấy reviews
  const { data: reviews, error: reviewError } = await supabase
    .from("reviews")
    .select("listing_id, rating");

  if (reviewError) throw new Error(reviewError.message || JSON.stringify(reviewError));

  // 2. Tính average rating
  const ratingMap: Record<number, { total: number; count: number }> = {};

  reviews?.forEach((r) => {
    if (!ratingMap[r.listing_id]) {
      ratingMap[r.listing_id] = { total: 0, count: 0 };
    }
    ratingMap[r.listing_id].total += r.rating;
    ratingMap[r.listing_id].count += 1;
  });

  // 3. Lọc listing có avg từ 4.5–5
  const validIds = Object.entries(ratingMap)
    .map(([listingId, value]) => ({
      id: Number(listingId),
      avg: value.total / value.count,
    }))
    .filter((item) => item.avg >= 4.5 && item.avg <= 5)
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 20)
    .map((item) => item.id);

  if (validIds.length === 0) return [];

  // 4. Lấy listings kèm images
  const { data: listings, error: listingError } = await supabase
    .from("listings")
    .select("*, listing_images:listing_images(url, is_thumbnail)")
    .in("id", validIds);

  if (listingError) throw new Error(listingError.message || JSON.stringify(listingError));

  // Map thumbnail_url cho từng listing
  const mapped = (listings as any[]).map(listing => {
    const thumbnail = listing.listing_images?.find((img: any) => img.is_thumbnail)?.url;
    return { ...listing, thumbnail_url: thumbnail };
  });
  return mapped;
}