import { supabase } from "@/src/lib/supabase";

export async function createBasicInfo(data: {
  host_id: string;
  category_id: number;
  title: string;
  description: string;
  listing_type: "HOME";
}) {
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...data,
      status: "DRAFT",
    })
    .select()
    .single();

  if (error) throw error;
  return listing;
}
