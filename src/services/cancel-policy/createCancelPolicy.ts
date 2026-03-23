import { supabase } from "@/src/lib/supabase";
import type { CancelPolicy } from "@/src/types/cancel-policy";

export type CreateCancelPolicyInput = {
  listing_id: number;
  name: string;
  description: string | null;
  refund_percentage: number;
  cancel_before_hours: number;
};

/**
 * Bảng `cancel_policy` có `id int4` NOT NULL nhưng không có IDENTITY/DEFAULT
 * → PostgREST không tự sinh id. Lấy max(id)+1 trước khi insert.
 * (Khi bạn thêm SERIAL/IDENTITY cho `id` trên DB, có thể bỏ bước này và chỉ insert các cột khác.)
 */
async function getNextCancelPolicyId(): Promise<number> {
  const { data, error } = await supabase
    .from("cancel_policy")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  const max = data?.id;
  if (typeof max === "number" && Number.isFinite(max)) return max + 1;
  return 1;
}

export async function createCancelPolicy(
  input: CreateCancelPolicyInput
): Promise<CancelPolicy> {
  const id = await getNextCancelPolicyId();

  const { data, error } = await supabase
    .from("cancel_policy")
    .insert({
      id,
      listing_id: input.listing_id,
      name: input.name,
      description: input.description,
      refund_percentage: input.refund_percentage,
      cancel_before_hours: input.cancel_before_hours,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CancelPolicy;
}
