/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Booking } from "@/src/types/booking";
import { getBookingById } from "@/src/services/booking/getBookingById";
import toast from "react-hot-toast";
import { Listing } from "@/src/types/listing";
import { getListingById } from "@/src/services/listing/getListingById";
import { formatPrice } from "@/src/utils/foormatPrice";

export default function Page() {
  const router = useRouter();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || Array.isArray(bookingId)) return;

      try {
        setLoading(true);
        const data = await getBookingById(bookingId);

        if (data) {
          const listing = await getListingById(data?.listing_id.toString());
          setListing(listing);
          setBooking(data);
        }
      } catch (error) {
        console.error("Fetch booking error:", error);
        toast.error("Failed to get booking");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading)
    return (
      <div>
        <Loader2
          className="animate-spin my-30 mx-auto text-teal-500"
          size={50}
        />
      </div>
    );

  if (booking)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full border rounded-2xl p-8 text-center space-y-6 shadow-md">
          <CheckCircle className="mx-auto text-green-600" size={60} />

          <div>
            <p className="text-2xl font-semibold">Booking request sent</p>
            <p className="text-sm text-slate-500 mt-1">
              Waiting for host approval
            </p>
          </div>

          <div className="border rounded-xl p-4 text-left text-sm space-y-2">
            <p className="font-medium">{listing?.title}</p>
            <p>
              {booking.check_in_date} · {booking.check_out_date}
            </p>
            <p>
              Guests: {booking.total_guests}{" "}
              {booking.total_guests > 1 ? "Adults" : "Adult"}
            </p>
            <p className="font-semibold">
              Total: ${formatPrice(booking.total_price)} USD
            </p>
            <p className="text-orange-600 font-medium">
              Status: {booking.status}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              Back to home
            </Button>

            <Button className="flex-1" onClick={() => router.push(`/bookings`)}>
              View my bookings
            </Button>
          </div>
        </div>
      </div>
    );

  return null;
}
