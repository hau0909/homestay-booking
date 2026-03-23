import { supabase } from "@/src/lib/supabase";

export const getUserHostApplication = async (userId: string) => {
  const { data, error } = await supabase
    .from("host_applications")
    .select(
      `id,
      user_id,
      status,
      identity_card_front_url,
      identity_card_back_url,
      created_at,
       updated_at,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("user_id", userId);

  if (error) throw error;

  return data;
};
