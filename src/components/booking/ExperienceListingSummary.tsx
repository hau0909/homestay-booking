"use client";
/* eslint-disable @next/next/no-img-element */

import { formatPrice } from "@/src/utils/foormatPrice";
import { getListingThumbnail } from "@/src/services/listing/getListingThumbnail";
import { useEffect, useState } from "react";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import { format } from "date-fns";
import { Voucher } from "@/src/types/voucher";

export default function ExperienceListingSummary({
  title,
  listingId,
  address,
  price_per_person,
  selectedDate,
  selectedSlot,
  guests,
  selectedVoucher,
}: {
  title: string;
  listingId: number;
  address: string;
  price_per_person: number;
  selectedDate: Date | undefined;
  selectedSlot: ExperienceSlot | null;
  guests: number;
  selectedVoucher: Voucher | null;
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState("/placeholder-img.png");

  const subtotal = price_per_person * guests;
  const discount = selectedVoucher ? selectedVoucher.discount_value : 0;
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    const fetchThumbnail = async () => {
      const listingImage = await getListingThumbnail(listingId);

      if (listingImage) {
        setThumbnailUrl(listingImage.url);
      }
    };

    if (listingId) {
      fetchThumbnail();
    }
  }, [listingId]);

  // Format the time nicely (e.g. 14:00:00 -> 2:00 PM)
  const formatTime = (timeString: string) => {
    try {
      if (timeString.includes("T") || timeString.includes("-")) {
        const date = new Date(timeString);
        return format(date, "h:mm a");
      }

      const [hours, minutes] = timeString.split(":");
      const d = new Date();
      d.setHours(parseInt(hours, 10));
      d.setMinutes(parseInt(minutes, 10));
      return format(d, "h:mm a");
    } catch {
      return timeString;
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-6 space-y-6 bg-white shadow-sm sticky top-10">
      {/* Listing info */}
      <div className="flex gap-4 items-start">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-24 h-24 rounded-xl object-cover border border-slate-100 shrink-0"
        />

        <div className="flex flex-col">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Experience
          </p>
          <p className="font-semibold text-lg leading-tight text-slate-800 line-clamp-2">
            {title || "Experience Title"}
          </p>
          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{address}</p>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Date & Time */}
      <div className="space-y-4">
        <div>
          <p className="font-medium text-slate-800">Date & Time</p>
          {selectedDate ? (
            <p className="text-sm text-slate-600 mt-1">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-1 italic">
              Please choose a date
            </p>
          )}

          {selectedSlot ? (
            <p className="text-sm text-slate-600 mt-1">
              {formatTime(selectedSlot.start_time)} -{" "}
              {formatTime(selectedSlot.end_time)}
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-1 italic">
              Please select a time slot
            </p>
          )}
        </div>

        {/* Guests */}
        <div>
          <p className="font-medium text-slate-800">Guests</p>
          <p className="text-sm text-slate-600 mt-1">
            {guests} guest{guests > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Price details */}
      <div className="space-y-3">
        <p className="font-medium text-slate-800">Price details</p>

        <div className="flex justify-between items-center text-sm text-slate-600">
          <p>
            ${formatPrice(price_per_person)} × {guests} guest
            {guests > 1 ? "s" : ""}
          </p>
          <p>${formatPrice(subtotal)}</p>
        </div>
        {selectedVoucher && (
          <div className="flex justify-between items-center text-sm text-teal-600">
            <p className="flex items-center gap-1">Voucher applied ({selectedVoucher.code})</p>
            <p>-${formatPrice(selectedVoucher.discount_value)}</p>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-slate-100">
        <p className="font-semibold text-slate-800">Total (USD)</p>
        <p className="font-bold text-xl text-slate-800">
          ${formatPrice(total)}
        </p>
      </div>
    </div>
  );
}
