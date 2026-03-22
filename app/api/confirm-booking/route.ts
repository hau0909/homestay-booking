import { NextResponse } from "next/server";
import { sendEmail } from "@/src/services/email/sendEmail.service";
import { supabase } from "@/src/lib/supabase";
import { error } from "console";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { booking_id } = await req.json();

    if (!booking_id) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        {
          status: 400,
        },
      );
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
    total_guests,
    total_price,
    payment_status,
    check_in_date,
    check_out_date,

  user:profiles!bookings_user_id_fkey (
      full_name,
      email
    ),

    listing:listings!bookings_listing_id_fkey (
    listing_type,
      title,
      host:profiles!listings_host_id_fkey (
        full_name,
        email
      )
    )
  `,
      )
      .eq("id", booking_id)
      .single();

    if (!booking) {
      throw new Error("Booking not found");
    }

    const guest = Array.isArray(booking.user) ? booking.user[0] : booking.user;
    const listing = Array.isArray(booking.listing)
      ? booking.listing[0]
      : booking.listing;
    const host = Array.isArray(listing.host) ? listing.host[0] : listing.host;

    if (!host?.email) {
      console.log("Host email not found");
      return NextResponse.json({ success: true });
    }

    await sendEmail(
      `"Booking System" <${process.env.EMAIL_USER}> `,
      guest.email,
      "Booking Confirmation",
      `
<div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:40px 0;">
  
  <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#2563eb; padding:20px; text-align:center; color:white;">
      <h2 style="margin:0;">Booking Confirmation</h2>
    </div>

    <!-- Content -->
    <div style="padding:30px; color:#333;">
      
      <h3 style="color:#2563eb;">Your booking is confirmed 🎉</h3>

      <p>Hi <strong>${guest.full_name}</strong>,</p>

      <p>
        Thank you for your booking! Your reservation for 
        <strong>${listing.title}</strong> has been successfully confirmed.
      </p>

      <!-- Booking Info -->
      <h4 style="margin-top:25px;">Booking Details</h4>

      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        
        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold;">
            Check-in
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            ${booking.check_in_date}
          </td>
        </tr>

        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold;">
            Check-out
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            ${booking.check_out_date}
          </td>
        </tr>

        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold;">
            Guests
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            ${booking.total_guests}
          </td>
        </tr>

        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold;">
            Total Price
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            $${booking.total_price}
          </td>
        </tr>

        <tr>
          <td style="padding:10px; font-weight:bold;">
            Payment Status
          </td>
          <td style="padding:10px;">
            ${booking.payment_status}
          </td>
        </tr>

      </table>

      <!-- Host Info -->
      <h4 style="margin-top:25px;">Host Information</h4>

      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        
        <tr>
          <td style="padding:10px; border-bottom:1px solid #eee; font-weight:bold;">
            Host Name
          </td>
          <td style="padding:10px; border-bottom:1px solid #eee;">
            ${host.full_name}
          </td>
        </tr>

        <tr>
          <td style="padding:10px; font-weight:bold;">
            Contact Email
          </td>
          <td style="padding:10px;">
            ${host.email}
          </td>
        </tr>

      </table>

      <p style="margin-top:25px;">
        If you have any questions, feel free to contact your host directly.
      </p>

      <p>
        We wish you a pleasant stay! 😊
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#777;">
      This is an automated email from Booking System.
    </div>

  </div>

</div>
`,
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
