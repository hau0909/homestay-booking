// trietcmce180982_sprint2
import React, { useState } from "react";
import { supabase } from "@/src/lib/supabase";

interface ReviewFormProps {
  listingId: string;
  userId: string;
  bookingId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ listingId, userId, bookingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let imageUrls: string[] = [];
    let reviewId: number | null = null;
    try {
      // Insert review trước
      const { data: reviewData, error: reviewError } = await supabase
        .from("reviews")
        .insert([
          {
            booking_id: bookingId,
            user_id: userId,
            listing_id: listingId,
            rating,
            comment,
            created_at: new Date().toISOString(),
          },
        ])
        .select();
      if (reviewError) throw reviewError;
      if (!reviewData || !reviewData[0] || !reviewData[0].id) {
        throw new Error("Không lấy được review_id");
      }
      reviewId = reviewData[0].id;

      // Upload ảnh lên storage và insert vào review_images
      if (images.length > 0) {
        setUploading(true);
        for (const file of images) {
          const fileName = `${userId}_${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("review-images")
            .upload(fileName, file);
          if (uploadError) {
            setError("Lỗi upload ảnh: " + uploadError.message);
            setUploading(false);
            setLoading(false);
            return;
          }
          const url = supabase.storage
            .from("review-images")
            .getPublicUrl(fileName).data.publicUrl;
          imageUrls.push(url);
          // Insert vào bảng review_images
          await supabase
            .from("review_images")
            .insert([
              {
                review_id: reviewId,
                url,
                created_at: new Date().toISOString(),
              },
            ]);
        }
        setUploading(false);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      let msg = "Lỗi gửi đánh giá";
      if (err && typeof err === "object" && "message" in err) {
        msg = (err as any).message || msg;
      }
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
      <div className="mb-2">
        <label className="block font-semibold mb-1">Đánh giá:</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={
                star <= rating
                  ? "text-yellow-500 text-2xl"
                  : "text-gray-300 text-2xl"
              }
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Nội dung đánh giá:</label>
        <textarea
          className="w-full border rounded p-2"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">Ảnh đánh giá:</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            if (e.target.files) {
              setImages(Array.from(e.target.files));
            }
          }}
        />
        {uploading && <div className="text-blue-500">Đang upload ảnh...</div>}
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="bg-[#328E6E] text-white px-4 py-2 rounded hover:bg-[#256b52]"
        disabled={loading}
      >
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}
