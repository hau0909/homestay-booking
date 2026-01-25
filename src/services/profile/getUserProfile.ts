import { supabase } from "@/src/lib/supabase";
import { Profile } from "@/src/types/profile";

export const getUser = async () => {
  const { data: user } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (
  userId: string,
): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};
