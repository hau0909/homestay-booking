import { supabase } from "@/src/lib/supabase";
import { getUser } from "./getUserProfile";

type UpdateProfilePayload = Partial<{
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  bio: string;
}>;

export const updateProfile = async (payload: UpdateProfilePayload) => {
  if (!payload || Object.keys(payload).length === 0) return;

  const { user } = await getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile error:", error);
    throw error;
  }
};
