import { supabase } from "@/src/lib/supabase";

export async function getHostDashboardData(userId: string) {
  // 1. Listings
  const { data: listings, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("host_id", userId)
    .order("created_at", { ascending: false });

  if (listingError) throw listingError;

  const listingIds = (listings ?? []).map(l => l.id);

  // 2. Bookings
  let bookings: any[] = [];
  if (listingIds.length > 0) {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .in("listing_id", listingIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    bookings = data ?? [];
  }

  return {
    listings: listings ?? [],
    bookings,
  };
}
