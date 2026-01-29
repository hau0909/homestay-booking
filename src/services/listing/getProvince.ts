import { supabase } from "@/src/lib/supabase";
import { Province } from "@/src/types/location";


export async function getProvinces(): Promise<Province[]> {
  const { data, error } = await supabase
    .from("provinces")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}
