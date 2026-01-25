import { getUserBookings } from "./getUserBookings";
import { getListingById } from "../listing/getListingById";
import { getListingThumbnail } from "../listing/getListingThumbnail";

// types/bookingView.ts
export interface BookingCard {
  id: string;
  listingName: string;
  thumbnailUrl: string | null;
  dateRange: string;
  guestsText: string;
  totalText: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}

export async function getUserBookingCards(): Promise<BookingCard[]> {
  const bookings = await getUserBookings();
  const filteredBookings = bookings.filter(
    (booking) => booking.status !== "DRAFT",
  );

  return Promise.all(
    filteredBookings.map(async (booking) => {
      const listing = await getListingById(booking.listing_id.toString());
      const thumbnail = await getListingThumbnail(booking.listing_id);

      return {
        id: booking.id.toString(),
        listingName: listing.title,
        thumbnailUrl: thumbnail?.url ?? null,
        dateRange: `${booking.check_in_date} → ${booking.check_out_date}`,
        guestsText: `${booking.total_guests} guests`,
        totalText: `$${booking.total_price} USD`,
        status: booking.status as "PENDING" | "CONFIRMED" | "CANCELLED",
      };
    }),
  );
}
