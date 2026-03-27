import { supabase } from "@/src/lib/supabase";
import { Home } from "@/src/types/home";

export const createHome = async (
  home: Partial<Home> & { listing_id: number }
): Promise<void> => {
  const { error } = await supabase
    .from("homes")
    .insert([home]);
  if (error) throw error;
};
