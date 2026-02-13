import { supabase } from "@/src/lib/supabase";

export const getHostStatus = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_host")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data.is_host;
};
