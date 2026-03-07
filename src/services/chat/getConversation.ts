import { supabase } from "@/src/lib/supabase";

export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      host_id,
      guest_id,
      last_message_content,
      updated_at,
      host:profiles!conversations_host_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      guest:profiles!conversations_guest_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      messages (
        id,
        sender_id,
        is_read,
        created_at
      )
    `,
    )
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`);

  if (error) {
    console.error("getConversations error:", error);
    return null;
  }

  return data;
};
