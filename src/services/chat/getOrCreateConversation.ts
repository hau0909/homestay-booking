import { supabase } from "@/src/lib/supabase";

export const getOrCreateConversation = async (
  hostId: string,
  guestId: string,
) => {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .or(
      `and(host_id.eq.${hostId},guest_id.eq.${guestId}),and(host_id.eq.${guestId},guest_id.eq.${hostId})`,
    )
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      host_id: hostId,
      guest_id: guestId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};
