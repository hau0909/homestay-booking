// trietcmce180982_sprint2
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import {
  BookingCard,
  getUserBookingCards,
} from "@/src/services/booking/getUserBookingCards";
import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/src/types/enums";
import { Loader2 } from "lucide-react";
import ReviewBookingButton from "@/src/components/booking/ReviewBookingButton";
import { supabase } from "@/src/lib/supabase";

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "CONFIRMED") {
    return <Badge className="bg-green-600">Confirmed</Badge>;
  }

  if (status === "PENDING") {
    return (
      <Badge variant="outline" className="text-orange-600 border-orange-600">
        Pending
      </Badge>
    );
  }

  return <Badge variant="destructive">Cancelled</Badge>;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserBookingCards().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div>
        <Loader2
          className="animate-spin my-30 mx-auto text-teal-500"
          size={50}
        />
      </div>
    );

  if (bookings.length === 0)
    return (
      <div className="bg-white py-10 px-40 pb-20">
        <p className="text-3xl font-semibold mb-2">Your bookings</p>
        <p className="text-slate-500">You don&apos;t have any bookings yet</p>
      </div>
    );

  return (
    <div className="bg-white py-10 px-40 pb-20 space-y-8">
      {/* Header */}
      <div>
        <p className="text-3xl font-semibold">Your bookings</p>
        <p className="text-sm text-slate-500">
          View your booking requests and their current status
        </p>
      </div>

      {/* Booking list */}
      <div className="space-y-5">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border rounded-2xl p-5 flex gap-5 items-start"
          >
            <img
              src={booking.thumbnailUrl || "/placeholder-img.png"}
              alt=""
              className="w-30 h-30 rounded-xl object-cover"
            />

            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-lg font-semibold">{booking.listingName}</p>
                <StatusBadge status={booking.status} />
              </div>

              <p className="text-sm text-slate-600">{booking.dateRange}</p>
              <p className="text-sm text-slate-600">
                Guests: {booking.guestsText}
              </p>
              <p className="font-medium">Total: {booking.totalText}</p>

              {/* Hiện nút review nếu status là CONFIRMED */}
              {booking.status === "CONFIRMED" && (
                  <ReviewBookingButton
                    listingId={String((booking as any).listingId || booking.id)}
                    userId={String((booking as any).userId || "")}
                    bookingId={String(booking.id)}
                  />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
