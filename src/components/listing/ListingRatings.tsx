"use client";

import { getAverageRatingByListing } from "@/src/services/listing/getAverageRatingByListing";
import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function ListingRatings({ listingId }: { listingId: number }) {
  const [average, setAverage] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const { average, total } = await getAverageRatingByListing(listingId);

      setAverage(average ?? 0);
      setTotal(total ?? 0);
      setIsLoading(false);
    };

    fetch();
  }, [listingId]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading total reviews...</span>
      </div>
    );

  if (total === 0) {
    return (
      <div className="flex justify-center">
        <p
          className="text-sm text-center text-muted-foreground border px-3 py-1 inline-block rounded-full
        bg-slate-100 shadow-2xs"
        >
          No reviews yet
        </p>
      </div>
    );
  }

  const meta = getRatingMeta(average);

  return (
    <div className="flex items-center justify-center gap-5">
      {/* Rating score */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${meta.color}`}
      >
        <Star size={18} className="fill-yellow-400 text-yellow-400" />
        <span className="text-lg font-semibold">{average.toFixed(1)}</span>
      </div>

      {/* Details */}
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{meta.label}</span>

        <span className="text-xs text-muted-foreground">
          {total} review{total > 1 ? "s" : ""} · Verified guests
        </span>
      </div>
    </div>
  );
}

function getRatingMeta(rating: number) {
  if (rating >= 4.8)
    return {
      label: "Exceptional",
      color: "bg-green-100 text-green-700 border-green-200",
    };

  if (rating >= 4.5)
    return {
      label: "Excellent",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

  if (rating >= 4.0)
    return {
      label: "Very Good",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    };

  if (rating >= 3.0)
    return {
      label: "Good",
      color: "bg-amber-100 text-amber-700 border-amber-200",
    };

  return {
    label: "Needs Improvement",
    color: "bg-red-100 text-red-700 border-red-200",
  };
}
