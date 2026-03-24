// trietcmce180982_sprint2
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const DownloadInvoiceButton = dynamic(
  () => import("@/src/components/booking/DownloadInvoiceButton"),
  { ssr: false }
);
import {
  BookingCard,
  getUserBookingCards,
} from "@/src/services/booking/getUserBookingCards";
import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/src/types/enums";
import { Loader2 } from "lucide-react";
import ReviewBookingButton from "@/src/components/booking/ReviewBookingButton";
import toast from "react-hot-toast";
import CancelBookingModal from "@/src/components/booking/CancelBookingModal";

function StatusBadge({
  status,
  bookingId,
  userId,
  onCancelSuccess,
}: {
  status: BookingStatus;
  bookingId: number;
  userId: string;
  onCancelSuccess: (bookingId: number) => void;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingCard[]>([]);

  const handleCancelBooking = async (reason: string) => {
    onCancelSuccess(bookingId);
  };
  if (status === "CONFIRMED") {
    return <Badge className="bg-green-600">Confirmed</Badge>;
  }

  if (status === "COMPLETED") {
    return <Badge className="bg-green-600">COMPLETED</Badge>;
  }

  if (status === "PENDING") {
    return (
      <div className="flex flex-col gap-4">
        {" "}
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          Pending
        </Badge>
        <button
          onClick={() => setOpenModal(true)}
          className="py-2 px-4 border rounded-2xl border-red-400 text-red-400 font-bold hover:bg-red-400 hover:text-white transition-colors duration-300 cursor-pointer"
        >
          Cancel Booking
        </button>
        <CancelBookingModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          userId={userId}
          onConfirm={handleCancelBooking}
          bookingId={bookingId}
        />
      </div>
    );
  }

  return <Badge variant="destructive">Cancelled</Badge>;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingCard[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCancelSuccess = (bookingId: number) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === String(bookingId) ? { ...b, status: "CANCELLED" } : b,
      ),
    );
  };

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
                <div>
                  <p className="text-lg font-semibold">{booking.listingName}</p>
                  <p
                    className={
                      "text-xs font-semibold " +
                      (booking.listingType === "HOME"
                        ? "text-[#328E6E]"
                        : "text-[#FF9900]")
                    }
                  >
                    {booking.listingType === "HOME" ? "Homestay" : "Experience"}
                  </p>
                </div>
                <StatusBadge
                  status={booking.status}
                  bookingId={Number(booking.id)}
                  userId={booking.userId}
                  onCancelSuccess={handleCancelSuccess}
                />
              </div>

              <p className="text-sm text-slate-600">{booking.dateRange}</p>
              <p className="text-sm text-slate-600">
                Guests: {booking.guestsText}
              </p>
              <p className="font-medium">Total: {booking.totalText}</p>

              {/* Hiện nút review nếu status là CONFIRMED */}
              {booking.status === "COMPLETED" && (
                <ReviewBookingButton
                  listingId={String((booking as any).listingId || booking.id)}
                  userId={String((booking as any).userId || "")}
                  bookingId={String(booking.id)}
                />
              )}

              {/* Hiện nút Download Invoice nếu paymentStatus là PAID */}
              {booking.paymentStatus === "PAID" && (
                <DownloadInvoiceButton booking={booking} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
