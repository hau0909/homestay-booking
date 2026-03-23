import { supabase } from "@/src/lib/supabase";

export const requestToSendApplicationAgain = async (
  hostApplicationId: string,
) => {
  const { error } = await supabase
    .from("host_applications")
    .update({ status: "request_again" })
    .eq("id", hostApplicationId)
    .select();

  if (error) throw error;
};
