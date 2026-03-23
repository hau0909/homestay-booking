import { supabase } from "@/src/lib/supabase";
import { Voucher } from "@/src/types/voucher";

export const getActiveVouchersByListingId = async (
  listingId: number
): Promise<Voucher[]> => {
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("listing_id", listingId)
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch vouchers", error);
    return [];
  }

  const activeVouchers = (data as Voucher[]).filter((v) => {
    if (v.usage_limit !== null && v.used_count !== null) {
      return v.used_count < v.usage_limit;
    }
    return true;
  });

  return activeVouchers;
};
