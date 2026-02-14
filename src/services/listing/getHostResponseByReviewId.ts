// trietcmce180982_sprint2
import { supabase } from "@/src/lib/supabase";
import { HostResponse } from "@/src/types/hostResponse";

export async function getHostResponseByReviewId(reviewId: number): Promise<HostResponse | null> {
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("review_id", reviewId)
    .single();
  if (error) return null;
  return data as HostResponse;
}
