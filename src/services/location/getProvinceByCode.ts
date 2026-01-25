import { Province } from "@/src/types/location";
import { supabase } from "@/src/lib/supabase";

export async function getProvinceByCode(
  code: string,
): Promise<Province | null> {
  const { data, error } = await supabase
    .from("provinces")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    console.error("getProvinceByCode error:", error);
    return null;
  }

  return data as Province;
}
