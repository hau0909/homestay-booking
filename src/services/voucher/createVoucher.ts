import { supabase } from "@/src/lib/supabase";
import type { Voucher } from "@/src/types/voucher";

export type CreateVoucherInput = {
  listing_id: number;
  code: string;
  discount_value: number;
  min_price: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
};

export async function createVoucher(
  input: CreateVoucherInput
): Promise<Voucher> {
  const { data, error } = await supabase
    .from("vouchers")
    .insert({
      listing_id: input.listing_id,
      code: input.code.trim(),
      discount_value: input.discount_value,
      min_price: input.min_price,
      max_discount: input.max_discount,
      usage_limit: input.usage_limit,
      used_count: input.used_count,
      is_active: input.is_active,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Voucher;
}
