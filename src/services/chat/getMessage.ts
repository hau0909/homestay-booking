import { supabase } from "@/src/lib/supabase";

export const getMessage = async (conversationId: string) => {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return data || [];
};
