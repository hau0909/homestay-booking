import { supabase } from "@/src/lib/supabase";
import type { CancelPolicy } from "@/src/types/cancel-policy";

export type UpdateCancelPolicyInput = {
  name: string;
  description: string | null;
  refund_percentage: number;
  cancel_before_hours: number;
};

export async function updateCancelPolicy(
  policyId: number,
  input: UpdateCancelPolicyInput
): Promise<CancelPolicy> {
  const { data, error } = await supabase
    .from("cancel_policy")
    .update({
      name: input.name,
      description: input.description,
      refund_percentage: input.refund_percentage,
      cancel_before_hours: input.cancel_before_hours,
    })
    .eq("id", policyId)
    .select()
    .single();

  if (error) throw error;
  return data as CancelPolicy;
}
