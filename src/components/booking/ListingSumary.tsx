"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge } from "@/components/ui/badge";
import { differenceInDays } from "date-fns";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { isWeekend } from "@/src/utils/isWeekend";
import { formatPrice } from "@/src/utils/foormatPrice";
import { getListingThumbnail } from "@/src/services/listing/getListingThumbnail";

export default function ListingSummary({
  title,
  listingId,
  address,
  price_weekday,
  price_weekend,
  dateRange,
  maxGuest,
}: {
  title: string;
  listingId: number;
  address: string;
  price_weekday: number;
  price_weekend: number;
  dateRange: any;
  maxGuest: number;
}) {
  const MAX_GUESTS = maxGuest;

  const [thumbnailUrl, setThumbnailUrl] = useState("/placeholder-img.png");

  const [guests, setGuests] = useState({
    adults: 1,
  });

  const increaseAdults = () => {
    setGuests((prev) => {
      if (prev.adults >= MAX_GUESTS) return prev;
      return { ...prev, adults: prev.adults + 1 };
    });
  };

  const decreaseAdults = () => {
    setGuests((prev) => {
      if (prev.adults <= 1) return prev;
      return { ...prev, adults: prev.adults - 1 };
    });
  };

  /** ===== Pricing config ===== */
  const WEEKDAY_PRICE = price_weekday;
  const WEEKEND_PRICE = price_weekend;

  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;

  let weekdayCount = 0;
  let weekendCount = 0;

  if (dateRange?.from && dateRange?.to) {
    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(dateRange.from);
      currentDate.setDate(currentDate.getDate() + i);

      if (isWeekend(currentDate)) {
        weekendCount++;
      } else {
        weekdayCount++;
      }
    }
  }

  const total = weekdayCount * price_weekday + weekendCount * price_weekend;

  useEffect(() => {
    const fetchThumbnail = async () => {
      const listingImage = await getListingThumbnail(listingId);

      if (listingImage) {
        setThumbnailUrl(listingImage.url);
      }
    };

    fetchThumbnail();
  }, [listingId]);

  return (
    <div className="border rounded-2xl p-5 space-y-6 bg-white shadow-sm">
      {/* Listing info */}
      <div className="flex gap-4">
        <img
          src={thumbnailUrl}
          alt=""
          className="w-20 h-20 rounded-xl object-cover"
        />

        <div>
          <p className="font-semibold text-lg">{title}</p>
          <p className="text-sm text-slate-500">{address}</p>

          {/* //! hiding rating star and guest favorate badge */}
          <div className="py-2 justify-between items-center hidden">
            <div className="flex items-start gap-1">
              <Star className="mt-0.5" size={20} />
              <p className="text-lg">3.5</p>
            </div>

            <Badge className="italic bg-amber-500">Guest Favorite</Badge>
          </div>
        </div>
      </div>

      <hr />

      {/* Guests */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Guests</p>
          <p className="text-sm text-slate-600">
            {guests.adults} adult{guests.adults > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={decreaseAdults}
            disabled={guests.adults <= 1}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
          >
            −
          </button>

          <span className="w-6 text-center">{guests.adults}</span>

          <button
            onClick={increaseAdults}
            disabled={guests.adults >= MAX_GUESTS}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <hr />

      {/* Date range */}
      {dateRange?.from &&
        dateRange?.to &&
        dateRange.from.getTime() !== dateRange.to.getTime() && (
          <div>
            <p className="font-medium">Check-in - Check-out Dates</p>
            <p className="text-sm text-slate-500">
              {dateRange.from.toDateString()} - {dateRange.to.toDateString()} (
              {nights} nights)
            </p>

            <hr className="mt-5" />
          </div>
        )}

      {/* Price details */}
      <div className="space-y-3">
        <p className="font-medium">Price details</p>

        <div className="space-y-1 text-sm text-slate-700">
          <p className="text-slate-500">
            Weekday: ${formatPrice(WEEKDAY_PRICE)} · Weekend: $
            {formatPrice(WEEKEND_PRICE)}
          </p>
        </div>
      </div>

      <hr />

      {/* Total */}
      <div className="flex justify-between items-center">
        <p className="font-semibold">
          Total <span className="underline">USD</span>
        </p>
        <p className="font-semibold text-lg">${formatPrice(total)} USD</p>
      </div>
    </div>
  );
}
