import { sendEmail } from "@/src/services/email/sendEmail.service";
import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { booking_id } = await req.json();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
    id,
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
      host.email,
      guest.email,
      "Tell us about your stay",
      `
<div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:40px 0;">
  
  <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#16a34a; padding:20px; text-align:center; color:white;">
      <h2 style="margin:0;">Homestay Booking</h2>
    </div>

    <!-- Content -->
    <div style="padding:30px; color:#333; line-height:1.6;">

      <p>Hi <strong>${guest.full_name}</strong>,</p>

      <p>
        Your stay at <strong>${listing.title}</strong> has just been completed 🎉
      </p>

      <p>
        We hope everything went well! If you have a moment, we’d really appreciate
        hearing about your experience.
      </p>

      <p>
        Your review helps future guests and supports our hosts.
      </p>

      <!-- Review Button -->
      <div style="text-align:center; margin:30px 0;">
        <a 
          href="http://localhost:3000/bookings" 
          style="background:#16a34a; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;"
        >
          ⭐ Write your review
        </a>
      </div>

      <p>
        Thanks again for booking with us. We hope to see you again soon!
      </p>

      <p>
        Warm regards,<br/>
        <strong>Homestay Booking Team</strong>
      </p>

    </div>

    <!-- Footer -->
    <div style="background:#f3f4f6; padding:15px; text-align:center; font-size:12px; color:#777;">
      This is an automated email from Homestay Booking System.
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
