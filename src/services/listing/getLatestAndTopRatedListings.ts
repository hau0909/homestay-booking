import { supabase } from "@/src/lib/supabase";
import { ListingWithStats } from "@/src/types/listing-response";

// Lấy 20 listing mới nhất
export async function getLatestListings(): Promise<ListingWithStats[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as ListingWithStats[];
}

// Lấy 20 listing có lượt booking cao nhất
export async function getTopBookedListings(): Promise<ListingWithStats[]> {
  // Lấy 20 listing có số lượt booking cao nhất
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images:listing_images(url, is_thumbnail), bookings(count)")
    .order("bookings.count", { ascending: false })
    .limit(20);
  if (error) throw error;
  // Map thumbnail_url cho từng listing
  const mapped = (data as any[]).map(listing => {
    const thumbnail = listing.listing_images?.find((img: any) => img.is_thumbnail)?.url;
    return { ...listing, thumbnail_url: thumbnail };
  });
  return mapped as ListingWithStats[];
}
