import { supabase } from "@/src/lib/supabase";

export async function getUserProfileById(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, email, phone, identity_card")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}
