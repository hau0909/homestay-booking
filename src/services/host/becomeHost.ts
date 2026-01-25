import { supabase } from "@/src/lib/supabase";
import { getUser } from "../profile/getUserProfile";

export const becomeHost = async (enable: boolean) => {
  const { user } = await getUser();

  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ is_host: enable })
    .eq("id", user.id);

  if (error) {
    console.error("Become a host mode failed");
    throw new Error("Failed to switch mode");
  }
};
