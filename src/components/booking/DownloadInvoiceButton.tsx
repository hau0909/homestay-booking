"use client";
import { useState } from "react";
import { generateInvoicePDF } from "@/src/utils/invoicePdf";
import { getUserProfileById } from "@/src/services/profile/getUserProfileById";

export default function DownloadInvoiceButton({ booking }: { booking: any }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const user = await getUserProfileById(booking.userId);
    setLoading(false);
    generateInvoicePDF({
      customerName: user?.full_name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      identityCard: user?.identity_card || "",
      roomOrExperience: booking.listingName,
      checkIn: booking.dateRange.split("→")[0].trim(),
      checkOut: booking.dateRange.split("→")[1].trim(),
      total: booking.totalText.replace(/[^\d.]/g, ""),
      paymentMethod: "Online/Bank/Cash",
      createdAt: new Date().toLocaleDateString(),
    });
  };

  return (
    <button
      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? "Generating..." : "Download Invoice"}
    </button>
  );
}
