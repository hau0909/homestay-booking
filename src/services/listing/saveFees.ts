import { supabase } from "@/src/lib/supabase";

export async function saveFees(
  listing_id: number,
  fees: { title: string; price: number }[]
) {
  if (!fees || fees.length === 0) return;

  for (const fee of fees) {
    await supabase.from("fees").insert({
      listing_id,
      title: fee.title,
      price: fee.price,
    });
  }
}
