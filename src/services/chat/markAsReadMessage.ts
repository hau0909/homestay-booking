import { supabase } from "@/src/lib/supabase";

export const markAsReadMessage = async (
  conversationId: string,
  currentUserId: string,
) => {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", currentUserId)
    .eq("is_read", false);

  if (error) {
    console.error("Mark messages read error:", error);
    throw error;
  }
};
