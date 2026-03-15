// trietcmce180982_sprint3
import React, { useEffect, useState } from "react";
import { getCustomerExperienceBookings } from "@/src/services/experience/getCustomerExperienceBookings";
import { supabase } from "@/src/lib/supabase";

interface Booking {
  id: string;
  status: string;
  total_price: number;
  experience_slot_id: string;
  experience_slots?: { start_time: string; end_time: string; experiences?: { title: string; listings?: { title: string } } };
  experiences?: { title: string };
  created_at?: string;
  total_guests?: number;
}

const statusColor: Record<string, string> = {
  PENDING: '#ff9800',
  CONFIRMED: '#43a047',
  REJECT: '#e53935',
  CANCELLED: '#e53935',
};

export default function ExperienceBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError("");
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) throw new Error("Not authenticated");
        const userId = userData.user.id;
        const data = await getCustomerExperienceBookings(userId);
        setBookings(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Your experience bookings</h2>
      <p style={{ color: '#888', fontSize: 16, marginBottom: 24 }}>View your booking requests and their current status</p>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {bookings.length === 0 ? (
            <div style={{ background: '#fff', padding: '40px 0', borderRadius: 16, textAlign: 'center', color: '#888', fontSize: 20 }}>No bookings found.</div>
          ) : bookings.map((booking, idx) => {
            // Lấy tên trải nghiệm/homestay (kiểm tra null)
            let experienceTitle = '';
            if (booking.experience_slots && booking.experience_slots.experiences) {
              experienceTitle = booking.experience_slots.experiences.title || '';
              if (booking.experience_slots.experiences.listings) {
                experienceTitle = booking.experience_slots.experiences.listings.title || experienceTitle;
              }
            }
            // Lấy ảnh (nếu có)
            const thumbnailUrl = booking.experience_slots && booking.experience_slots.experiences && booking.experience_slots.experiences.thumbnail_url ? booking.experience_slots.experiences.thumbnail_url : "/placeholder-img.png";
            // Ngày
            const dateRange = booking.experience_slots?.start_time && booking.experience_slots?.end_time ? `${new Date(booking.experience_slots.start_time).toLocaleDateString('en-CA')} → ${new Date(booking.experience_slots.end_time).toLocaleDateString('en-CA')}` : '';
            // Số khách
            const guestsText = `${booking.total_guests || 1} guests`;
            // Tổng tiền
            const totalText = `$${booking.total_price} USD`;
            // Badge status
            const badge = (
              <span style={{
                display: 'inline-block',
                background: '#fff',
                color: statusColor[booking.status] || '#ff9800',
                border: `1.5px solid ${statusColor[booking.status] || '#ff9800'}`,
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                padding: '4px 18px',
                marginBottom: 8,
              }}>{booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}</span>
            );
            // Nút Cancel
            const cancelBtn = booking.status === 'PENDING' ? (
              <button style={{
                padding: '10px 32px',
                borderRadius: 12,
                border: '1.5px solid #ff9800',
                background: '#fff',
                color: '#ff9800',
                fontWeight: 700,
                fontSize: 17,
                cursor: 'pointer',
                marginTop: 8,
                transition: 'all 0.18s',
              }}>Cancel Booking</button>
            ) : null;
            return (
              <div key={booking.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32, marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center' }}>
                <img src={thumbnailUrl} alt="" style={{ width: 96, height: 96, borderRadius: 16, objectFit: 'cover', background: '#f7fafd' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{experienceTitle}</div>
                    <div>{badge}</div>
                  </div>
                  <div style={{ color: '#555', fontSize: 15, margin: '8px 0' }}>{dateRange}</div>
                  <div style={{ color: '#555', fontSize: 15 }}>Guests: {guestsText}</div>
                  <div style={{ fontWeight: 600, fontSize: 16, marginTop: 6 }}>Total: {totalText}</div>
                  {cancelBtn}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
