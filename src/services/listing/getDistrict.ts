import { supabase } from "@/src/lib/supabase";
import { District } from "@/src/types/location";


export async function getDistrictsByProvince(
  provinceCode: string
): Promise<District[]> {
  if (!provinceCode) return [];

  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("province_code", provinceCode)
    .order("name");

  if (error) throw error;
  return data ?? [];
}
