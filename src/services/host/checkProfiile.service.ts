import { supabase } from "@/src/lib/supabase";

export const isProfileCompleted = async (userId: string): Promise<boolean> => {
  const { error, data } = await supabase
    .from("profiles")
    .select("bio, full_name, phone, identity_card")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return Boolean(
    data?.bio && data?.full_name && data?.identity_card && data?.phone,
  );
};
