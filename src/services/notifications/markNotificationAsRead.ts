import { supabase } from "@/src/lib/supabase";

export const markNotificationAsRead = async (userId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId);

  if (error) throw error;
};

export const markOneNotificationAsRead = async (id: stirng) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) throw error;
};
