import { supabase } from "@/src/lib/supabase";

export async function getRules() {
  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .order("id");

  if (error) throw error;
  return data;
}