import { supabase } from "@/src/lib/supabase";

export const updateExperience = async (
  id: number,
  title: string,
  description: string | null,
  price: number
) => {
  const { error } = await supabase
    .from("experiences")
    .update({
      title,
      description,
      price_per_person: price,
    })
    .eq("id", id);

  if (error) {
    console.error("Update experience failed:", error);
    return false;
  }

  return true;
};