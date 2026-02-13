// trietcmce180982_sprint2
import React, { useState, useEffect } from "react";
import ReviewForm from "../listing/ReviewForm";
import { supabase } from "@/src/lib/supabase";

interface ReviewBookingButtonProps {
  listingId: string;
  userId: string;
  bookingId: string;
}

export default function ReviewBookingButton({ listingId, userId, bookingId }: ReviewBookingButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const checkReviewed = async () => {
      const { data: reviews } = await supabase
        .from("reviews")
        .select("id")
        .eq("listing_id", listingId)
        .eq("user_id", userId);
      setHasReviewed(Array.isArray(reviews) && reviews.length > 0);
    };
    checkReviewed();
  }, [listingId, userId]);

  if (hasReviewed) {
    return <div className="text-green-600">Bạn đã đánh giá.</div>;
  }

  return (
    <div>
      {!showForm ? (
        <button
          className="bg-[#328E6E] text-white px-4 py-2 rounded hover:bg-[#256b52] mb-2"
          onClick={() => setShowForm(true)}
        >
          Viết đánh giá
        </button>
      ) : (
        <ReviewForm listingId={listingId} userId={userId} bookingId={bookingId} onSuccess={() => window.location.reload()} />
      )}
    </div>
  );
}
