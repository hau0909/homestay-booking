import { supabase } from "@/src/lib/supabase";
import type { Voucher } from "@/src/types/voucher";

export const getVouchersByListingId = async (
  listingId: number
): Promise<Voucher[]> => {
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch vouchers", error);
    return [];
  }

  return (data as Voucher[]) ?? [];
};
