import { supabase } from "@/src/lib/supabase";

export async function saveRulesFromText(
  listingId: number,
  rules: string[]
) {
  // Find old rules to delete from rules table
  const { data: oldLinks } = await supabase
    .from("listing_rules")
    .select("rule_id")
    .eq("listing_id", listingId);

  // Delete links first
  const { error: delErr } = await supabase.from("listing_rules").delete().eq("listing_id", listingId);
  if (delErr) throw delErr;

  // Delete orphaned rules
  if (oldLinks && oldLinks.length > 0) {
    const ruleIds = oldLinks.map(link => link.rule_id);
    await supabase.from("rules").delete().in("id", ruleIds);
  }

  if (!rules || rules.length === 0) return;

  const payload: { listing_id: number; rule_id: number }[] = [];

  for (const content of rules) {
  const newId = Math.floor(Math.random() * 1000000000);

const { data, error } = await supabase
  .from("rules")
  .insert({
    id: newId,
    content,
  })
  .select()
  .single();

    if (error) throw error;

    payload.push({
      listing_id: listingId,
      rule_id: data.id,
    });
  }

  await supabase.from("listing_rules").insert(payload);
}