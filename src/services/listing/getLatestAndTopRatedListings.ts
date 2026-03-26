import { supabase } from "@/src/lib/supabase";
import { ListingWithStats } from "@/src/types/listing-response";

// Lấy 20 listing mới nhất
export async function getLatestListings(): Promise<ListingWithStats[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images:listing_images(url, is_thumbnail)")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message || JSON.stringify(error));
  // Map thumbnail_url cho từng listing
  const mapped = (data as any[]).map(listing => {
    const thumbnail = listing.listing_images?.find((img: any) => img.is_thumbnail)?.url;
    return { ...listing, thumbnail_url: thumbnail };
  });
  return mapped as ListingWithStats[];
}

// Lấy 20 listing có lượt booking cao nhất
export async function getTopBookedListings(): Promise<ListingWithStats[]> {
  // Lấy 20 listing cùng số lượt booking
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images:listing_images(url, is_thumbnail), bookings(id)")
    .limit(50); // lấy nhiều hơn để sort client
  if (error) throw new Error(error.message || JSON.stringify(error));
  // Map thumbnail_url và tính số lượt booking
  const mapped = (data as any[]).map(listing => {
    const thumbnail = listing.listing_images?.find((img: any) => img.is_thumbnail)?.url;
    const total_bookings = listing.bookings ? listing.bookings.length : 0;
    return { ...listing, thumbnail_url: thumbnail, total_bookings };
  });
  // Lọc chỉ lấy các listing được book >= 2 lần
  const filtered = mapped.filter(l => l.total_bookings >= 2);
  // Sắp xếp theo số lượt booking giảm dần và lấy top 20
  filtered.sort((a, b) => b.total_bookings - a.total_bookings);
  return filtered.slice(0, 20) as ListingWithStats[];
}
