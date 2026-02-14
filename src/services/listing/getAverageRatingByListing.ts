import { supabase } from "@/src/lib/supabase";

export const getAverageRatingByListing = async (listingId: number) => {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("listing_id", listingId);

  if (error) {
    console.error(error);
    return { average: 0, total: 0 };
  }

  if (!data.length) {
    return { average: 0, total: 0 };
  }

  const total = data.length;
  const sum = data.reduce((acc, r) => acc + r.rating, 0);

  return {
    average: Number((sum / total).toFixed(1)),
    total,
  };
};
