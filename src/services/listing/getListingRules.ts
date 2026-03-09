import { supabase } from "@/src/lib/supabase";
import { Rule } from "@/src/types/rule";

export async function getListingRules(listingId: number | string): Promise<Rule[]> {
  const { data, error } = await supabase
    .from("listing_rules")
    .select(`
      rule_id,
      rules(id, content)
    `)
    .eq("listing_id", listingId);

  if (error) throw error;
  
  // Transform the data to return just the rules
  return data?.map((item: any) => item.rules).filter(Boolean) ?? [];
}
