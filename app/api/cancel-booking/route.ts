import { NextResponse } from "next/server";
import { sendEmail } from "@/src/services/email/sendEmail.service";
import { cancelBooking } from "@/src/services/booking/cancelBooking.service";
import { supabase } from "@/src/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId, bookingId, reason } = await req.json();

    if (!userId || !bookingId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await cancelBooking(userId, bookingId, reason);

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
    check_in_date,
    check_out_date,
    total_price,

    listing:listings!bookings_listing_id_fkey (
      title,
      host:profiles!listings_host_id_fkey (
        full_name,
        email
      )
    )
  `,
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      throw new Error("Failed to fetch booking info");
    }

    const listing = Array.isArray(booking.listing)
      ? booking.listing[0]
      : booking.listing;
    const host = Array.isArray(listing?.host)
      ? listing?.host[0]
      : listing?.host;

    if (!host?.email) {
      console.log("no host email found");
      return NextResponse.json({ success: true });
    }

    if (host?.email) {
      await sendEmail(
        `"Booking System" <${process.env.EMAIL_USER}>`,
        host.email,
        "A guest cancelled their booking",
        `
<div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:40px 0;">
  
  <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#1d4ed8; padding:20px; text-align:center; color:white;">
      <h2 style="margin:0;">Booking System</h2>
    </div>

    <!-- Content -->
    <div style="padding:30px; color:#333;">
      
      <h3 style="color:#dc2626;">Booking Cancelled by Guest</h3>

      <p>Hi <strong>${host.full_name}</strong>,</p>

      <p>
        A guest has cancelled your booking for 
        <strong>${listing.title}</strong>.
      </p>

      <!-- Booking Info -->
      <table style="width:100%; border-collapse:collapse; margin-top:20px;">
        
        <tr>
          <td style="padding:12px; border-bottom:1px solid #eee; font-weight:bold;">
            Check-in
          </td>
          <td style="padding:12px; border-bottom:1px solid #eee;">
            ${booking.check_in_date}
          </td>
        </tr>

        <tr>
          <td style="padding:12px; border-bottom:1px solid #eee; font-weight:bold;">
            Check-out
          </td>
          <td style="padding:12px; border-bottom:1px solid #eee;">
            ${booking.check_out_date}
          </td>
        </tr>

        <tr>
          <td style="padding:12px; font-weight:bold;">
            Reason
          </td>
          <td style="padding:12px;">
            ${reason}
          </td>
        </tr>

      </table>

    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#777;">
      This is an automated email from Booking System.
    </div>

  </div>

</div>
`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
