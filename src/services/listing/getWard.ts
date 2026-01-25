import { supabase } from "@/src/lib/supabase";
import { Ward } from "@/src/types/location";


export async function getWardsByDistrict(
  districtCode: string
): Promise<Ward[]> {
  if (!districtCode) return [];

  const { data, error } = await supabase
    .from("wards")
    .select("*")
    .eq("district_code", districtCode)
    .order("name");

  if (error) throw error;
  return data ?? [];
}
