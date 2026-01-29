import { Province } from "@/src/types/location";
import { supabase } from "@/src/lib/supabase";

export async function getAllProvinces(): Promise<Province[]> {
  const { data, error } = await supabase
    .from("provinces")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("getAllProvinces error:", error);
    return [];
  }

  return data as Province[];
}
