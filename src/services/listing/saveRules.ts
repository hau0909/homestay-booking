import { supabase } from "@/src/lib/supabase";

export async function saveRulesFromText(
  listingId: number,
  rules: string[]
) {
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