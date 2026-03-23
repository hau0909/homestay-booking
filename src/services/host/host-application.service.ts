import { supabase } from "@/src/lib/supabase";
import { HostApplication } from "@/src/types/hostApplication";

export const sendBecomeHostRequest = async (
  userId: string,
  frontUrl: string,
  backUrl: string,
): Promise<HostApplication> => {
  const { data: existing } = await supabase
    .from("host_applications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "pending") {
      throw new Error(
        "You already have a pending request. Please wait for admin approval.",
      );
    }
    if (existing.status === "approved") {
      throw new Error("Your request has already been approved.");
    }
    if (existing.status === "rejected") {
      throw new Error(
        "Your current request was rejected. You cannot send again!",
      );
    }
    if (existing.status === "request_again") {
      throw new Error(
        "Admin requested additional information. Please update your existing request.",
      );
    }
  }

  const { data, error } = await supabase
    .from("host_applications")
    .upsert(
      {
        user_id: userId,
        identity_card_front_url: frontUrl,
        identity_card_back_url: backUrl,
        status: "pending",
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) throw error;

  return data;
};
