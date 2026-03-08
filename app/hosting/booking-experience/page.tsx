"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

interface ExperienceBooking {
  id: string;
  experience_id: string;
  user_id: string;
  status: string;
  booking_date: string;
  price: number;
  experienceTitle?: string;
  slot_start_time?: string;
  slot_end_time?: string;
  attendees?: number;
}

export default function BookingExperiencePage() {
  const [bookings, setBookings] = useState<ExperienceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        // Lấy user hiện tại
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) throw new Error("Not authenticated");
        const hostId = userData.user.id;

        // Lấy tất cả experience của host
        const { data: experiences, error: expError } = await supabase
          .from("experiences")
          .select("id, title")
          .eq("host_id", hostId);
        if (expError) throw expError;
        const expMap: Record<string, string> = {};
        (experiences || []).forEach((e: any) => {
          expMap[e.id] = e.title;
        });
        const expIds = (experiences || []).map((e: any) => e.id);

        // Lấy tất cả booking của các experience đó
        let bookingsData: ExperienceBooking[] = [];
        if (expIds.length > 0) {
          // Lấy thêm thông tin slot và số lượng người tham gia
          const { data: bookings, error: bookingsError } = await supabase
            .from("experience_bookings")
            .select("*, experience_slots(start_time, end_time), attendees")
            .in("experience_id", expIds);
          if (bookingsError) throw bookingsError;
          bookingsData = (bookings || []).map((b: any) => ({
            ...b,
            experienceTitle: expMap[b.experience_id],
            slot_start_time: b.experience_slots?.start_time || b.start_time,
            slot_end_time: b.experience_slots?.end_time || b.end_time,
            attendees: b.attendees || b.num_attendees || b.quantity || 1,
          }));
        }
        setBookings(bookingsData);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div style={{ background: "#f7fafd", minHeight: "100vh", padding: "32px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18, color: "#222", letterSpacing: 0.2 }}>
        Booking Experience Management
      </h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      <div style={{ overflowX: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1.5px solid #e3e8ee", padding: 8 }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 900, fontFamily: "inherit" }}>
          <thead style={{ background: "#f0f4f8" }}>
            <tr>
              <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>#</th>
              <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Experience</th>
              <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Guest</th>
              <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Time</th>
              <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Attendees</th>
              <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Booking Date</th>
              <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Status</th>
              <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking: any, idx: number) => (
              <tr key={booking.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f6fafd", transition: "background 0.2s", cursor: "pointer" }}>
                <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 600, color: "#222" }}>{idx + 1}</td>
                <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 600, color: "#1a237e" }}>{booking.experienceTitle || "Experience #" + booking.experience_id}</td>
                <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#374151" }}>{booking.user_id}</td>
                <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#222" }}>
                  {booking.slot_start_time ? new Date(booking.slot_start_time).toLocaleString() : "-"}
                  {booking.slot_end_time ? " - " + new Date(booking.slot_end_time).toLocaleString() : ""}
                </td>
                <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#222" }}>{booking.attendees || 1}</td>
                <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#222", fontWeight: 500 }}>{booking.booking_date}</td>
                <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee" }}>
                  <span style={{ color: booking.status === "CONFIRMED" ? "#219653" : booking.status === "REJECTED" ? "#d32f2f" : booking.status === "COMPLETED" ? "#1976d2" : booking.status === "PENDING" ? "#ff9800" : "#555", fontWeight: 700, letterSpacing: 0.5 }}>{booking.status}</span>
                  {booking.status === "PENDING" && (
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      <button
                        style={{ background: "#219653", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontWeight: 600, cursor: "pointer" }}
                        onClick={async () => {
                          setLoading(true);
                          await supabase
                            .from("experience_bookings")
                            .update({ status: "CONFIRMED" })
                            .eq("id", booking.id);
                          setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: "CONFIRMED" } : b));
                          setLoading(false);
                        }}
                      >✅ Confirm</button>
                      <button
                        style={{ background: "#d32f2f", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontWeight: 600, cursor: "pointer" }}
                        onClick={async () => {
                          setLoading(true);
                          await supabase
                            .from("experience_bookings")
                            .update({ status: "REJECTED" })
                            .eq("id", booking.id);
                          setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: "REJECTED" } : b));
                          setLoading(false);
                        }}
                      >❌ Reject</button>
                    </div>
                  )}
                </td>
                <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 700, color: "#222" }}>${booking.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && bookings.length === 0 && (
          <div style={{ padding: 32, color: "#888", textAlign: "center" }}>
            No bookings found for your experiences.
          </div>
        )}
      </div>
    </div>
  );
}
