import { supabase } from "@/src/lib/supabase";

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Send message error:", error);
    return null;
  }

  const { error: updateError } = await supabase
    .from("conversations")
    .update({
      last_message_content: content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (updateError) {
    console.error("Update conversation error:", updateError);
  }

  return data;
};
