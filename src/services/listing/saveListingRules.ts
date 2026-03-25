import { supabase } from "@/src/lib/supabase";

export async function saveListingRules(listingId: number, ruleIds: number[]) {
  // Remove all old rules for this listing first
  const { error: deleteError } = await supabase
    .from("listing_rules")
    .delete()
    .eq("listing_id", listingId);
  if (deleteError) throw deleteError;

  if (!ruleIds.length) return;

  const payload = ruleIds.map((rule_id) => ({
    listing_id: listingId,
    rule_id,
  }));

  const { error } = await supabase
    .from("listing_rules")
    .insert(payload);

  if (error) throw error;
}
