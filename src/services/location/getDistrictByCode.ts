import { District } from "@/src/types/location";
import { supabase } from "@/src/lib/supabase";

export async function getDistrictByCode(
  code: string,
): Promise<District | null> {
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    console.error("getDistrictByCode error:", error);
    return null;
  }

  return data as District;
}
