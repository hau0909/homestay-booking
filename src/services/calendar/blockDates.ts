import { supabase } from "@/src/lib/supabase";
import { formatDateLocal } from "@/src/utils/fomartDateLocal";

export async function blockDates(
  listingId: number,
  blockedDates: Date[],
  quantity: number,
) {
  if (!blockedDates.length) return;

  const formattedDates = blockedDates.map((date) => formatDateLocal(date));

  // existing dates
  const { data: existingDates, error: fetchError } = await supabase
    .from("calendar")
    .select("date")
    .eq("listing_id", listingId)
    .in("date", formattedDates);

  if (fetchError) {
    console.error("Fetch calendar error:", fetchError);
    return;
  }

  // get date in calendars
  const existingDateStrings = existingDates?.map((d) => d.date) || [];

  // date need to update
  const datesToUpdate = formattedDates.filter((d) =>
    existingDateStrings.includes(d),
  );

  // new date need to insert
  const datesToInsert = formattedDates.filter(
    (d) => !existingDateStrings.includes(d),
  );

  //  update
  if (datesToUpdate.length > 0) {
    const { error: updateError } = await supabase
      .from("calendar")
      .update({ is_block: true })
      .eq("listing_id", listingId)
      .in("date", datesToUpdate);

    if (updateError) {
      console.error("Update error:", updateError);
      return;
    }
  }

  // insert new
  if (datesToInsert.length > 0) {
    const insertPayload = datesToInsert.map((date) => ({
      listing_id: listingId,
      date,
      available_count: quantity,
      is_block: true,
    }));

    const { error: insertError } = await supabase
      .from("calendar")
      .insert(insertPayload);

    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }
  }

  return true;
}
