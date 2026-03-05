import { supabase } from "@/src/lib/supabase";

export async function saveRules(
  listingId: number,
  ruleIds: number[]
) {
  if (!ruleIds || ruleIds.length === 0) return;

  const payload = ruleIds.map((ruleId) => ({
    listing_id: listingId,
    rule_id: ruleId,
  }));

  const { error } = await supabase
    .from("listing_rules")
    .insert(payload);

  if (error) throw error;
}