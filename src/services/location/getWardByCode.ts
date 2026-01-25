import { Ward } from "@/src/types/location";
import { supabase } from "@/src/lib/supabase";

export async function getWardByCode(code: string): Promise<Ward | null> {
  const { data, error } = await supabase
    .from("wards")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    console.error("getWardByCode error:", error);
    return null;
  }

  return data as Ward;
}
