import { supabase } from "@/src/lib/supabase";
import { getUser } from "../profile/getUserProfile";

export const getHostStatus = async (): Promise<boolean> => {
  const { user } = await getUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("is_host")
    .eq("id", user?.id)
    .single();

  if (error) throw error;

  return data.is_host;
};
