import { supabase } from "@/src/lib/supabase";
import { getUser } from "./getUserProfile";


export async function checkProfileStatus() {
    const { user } = await getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }
  const { data, error } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Check profile status error:", error);
    throw error;
  }

  return data?.status === "active";
}