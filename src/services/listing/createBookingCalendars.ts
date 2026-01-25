import { supabase } from "@/src/lib/supabase";
import { isWeekend } from "@/src/utils/isWeekend";
import { DateRange } from "react-day-picker";

type CreateCalendarsPayload = {
  listingId: number;
  dateRange: DateRange;
  weekdayPrice: number;
  weekendPrice: number;
  maxGuest: number;
};

export async function createBookingCalendars(payload: CreateCalendarsPayload) {
  const { listingId, dateRange, weekdayPrice, weekendPrice, maxGuest } =
    payload;

  if (!dateRange.from || !dateRange.to) {
    throw new Error("Invalid date range");
  }

  //  Lấy calendar hiện có
  const { data: calendars, error } = await supabase
    .from("calendar")
    .select("*")
    .eq("listing_id", listingId);

  if (error) throw error;

  //  Build list ngày
  const days: Date[] = [];
  for (
    let d = new Date(dateRange.from);
    d < dateRange.to;
    d.setDate(d.getDate() + 1)
  ) {
    days.push(new Date(d));
  }

  // 3️⃣ Update / Insert calendar
  for (const date of days) {
    const dateStr = date.toISOString().split("T")[0];

    const existed = calendars?.find((c) => c.date === dateStr);

    if (existed) {
      if (existed.available_count <= 0) {
        throw new Error(`Date ${dateStr} is fully booked`);
      }

      const { error } = await supabase
        .from("calendar")
        .update({
          available_count: existed.available_count - 1,
        })
        .eq("id", existed.id);

      if (error) throw error;
    } else {
      const price = isWeekend(date) ? weekendPrice : weekdayPrice;

      const { error } = await supabase.from("calendar").insert({
        listing_id: listingId,
        date: dateStr,
        available_count: maxGuest - 1,
        price,
      });

      if (error) throw error;
    }
  }
}
