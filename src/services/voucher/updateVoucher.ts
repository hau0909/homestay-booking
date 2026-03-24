import { supabase } from "@/src/lib/supabase";
import type { Voucher } from "@/src/types/voucher";

export type UpdateVoucherInput = {
  code: string;
  discount_value: number;
  min_price: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
};

export async function updateVoucher(
  voucherId: number,
  input: UpdateVoucherInput
): Promise<Voucher> {
  const { data, error } = await supabase
    .from("vouchers")
    .update({
      code: input.code.trim(),
      discount_value: input.discount_value,
      min_price: input.min_price,
      max_discount: input.max_discount,
      usage_limit: input.usage_limit,
      used_count: input.used_count,
      is_active: input.is_active,
    })
    .eq("id", voucherId)
    .select()
    .single();

  if (error) throw error;
  return data as Voucher;
}
