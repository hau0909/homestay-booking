import { supabase } from "@/src/lib/supabase";
import type { CancelPolicy } from "@/src/types/cancel-policy";

export async function getPoliciesByListingIds(
  listingIds: number[]
): Promise<Record<number, CancelPolicy[]>> {
  if (!listingIds.length) return {};

  const { data, error } = await supabase
    .from("cancel_policy")
    .select("*")
    .in("listing_id", listingIds)
    .order("id", { ascending: true });

  if (error) throw error;

  const map: Record<number, CancelPolicy[]> = {};
  for (const row of data as CancelPolicy[]) {
    if (!map[row.listing_id]) map[row.listing_id] = [];
    map[row.listing_id].push(row);
  }
  return map;
}
