"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  bookingId: number;
  userId: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const CancelBookingModal = ({
  isOpen,
  onClose,
  onConfirm,
  bookingId,
  userId,
}: Props) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (reason.trim() == "") {
      toast.error("Please enter a cancellation reason");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/cancel-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          bookingId,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Cancel failed");
      }

      toast.success("Booking cancelled successfully");

      setReason("");
      onConfirm(reason);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Cancel Booking</h2>

        <textarea
          placeholder="Please enter your cancellation reason..."
          className="w-full border rounded-xl p-3 h-28 resize"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border"
          >
            Close
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
          >
            {loading ? "Cancelling..." : " Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
