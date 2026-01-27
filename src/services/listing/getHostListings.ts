import { supabase } from "@/src/lib/supabase";
import { Listing } from "@/src/types/listing";

// Lấy tất cả listings của host hiện tại (hoặc toàn bộ listings nếu không truyền hostId)
export async function getHostListings(hostId?: string): Promise<Listing[]> {
  let query = supabase.from("listings").select("*");
  if (hostId) query = query.eq("host_id", hostId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data as Listing[];
}
