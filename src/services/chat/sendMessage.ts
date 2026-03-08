import { supabase } from "@/src/lib/supabase";

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  imageUrl?: string,
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      image_url: imageUrl || null,
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
      last_message_content: imageUrl ? "Sent an image" : content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (updateError) {
    console.error("Update conversation error:", updateError);
  }

  return data;
};
