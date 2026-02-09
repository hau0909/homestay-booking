import { supabase } from "@/src/lib/supabase";
import { HostApplication } from "@/src/types/hostApplication";

export const sendBecomeHostRequest = async (
  userId: string,
  frontUrl: string,
  backUrl: string,
): Promise<HostApplication> => {
  const { data: pending } = await supabase
    .from("host_applications")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "pending")
    .single();

  if (pending)
    throw new Error(
      "You already have a pending request. Please wait for the acceptance from admin!",
    );

  const { data, error } = await supabase
    .from("host_applications")
    .insert({
      user_id: userId,
      identity_card_front_url: frontUrl,
      identity_card_back_url: backUrl,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
};
