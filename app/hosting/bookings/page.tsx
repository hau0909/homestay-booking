

"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";


export default function Page() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Lấy user hiện tại
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) throw new Error("Not authenticated");
        const hostId = userData.user.id;

        // 2. Lấy tất cả listing của host
        const { data: listings, error: listingsError } = await supabase
          .from("listings")
          .select("id, title")
          .eq("host_id", hostId);
        if (listingsError) throw listingsError;
        const listingMap = {};
        (listings || []).forEach((l) => { listingMap[l.id] = l.title; });
        const listingIds = (listings || []).map((l) => l.id);

        // 3. Lấy tất cả booking của các listing đó
        let bookingsData = [];
        if (listingIds.length > 0) {
          const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("*")
            .in("listing_id", listingIds);
          if (bookingsError) throw bookingsError;
          bookingsData = (bookings || []).map((b) => ({ ...b, listingTitle: listingMap[b.listing_id] }));
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
    <div style={{ background: '#f7fafd', minHeight: '100vh', padding: '32px' }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 28, color: '#222', letterSpacing: 0.5 }}>All Bookings for Your Listings</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #e3e8ee', padding: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 900, fontFamily: 'inherit' }}>
          <thead style={{ background: '#f0f4f8' }}>
            <tr>
              <th style={{ padding: '14px 10px', borderBottom: '2px solid #e3e8ee', textAlign: 'left', fontSize: 15, color: '#333', fontWeight: 700 }}>#</th>
              <th style={{ padding: '14px 10px', borderBottom: '2px solid #e3e8ee', textAlign: 'left', fontSize: 15, color: '#333', fontWeight: 700 }}>Listing</th>
              <th style={{ padding: '14px 10px', borderBottom: '2px solid #e3e8ee', textAlign: 'left', fontSize: 15, color: '#333', fontWeight: 700 }}>Guest</th>
              <th style={{ padding: '14px 10px', borderBottom: '2px solid #e3e8ee', textAlign: 'left', fontSize: 15, color: '#333', fontWeight: 700 }}>Check-in</th>
              <th style={{ padding: '14px 10px', borderBottom: '2px solid #e3e8ee', textAlign: 'left', fontSize: 15, color: '#333', fontWeight: 700 }}>Check-out</th>
              <th style={{ padding: '14px 10px', borderBottom: '2px solid #e3e8ee', textAlign: 'left', fontSize: 15, color: '#333', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 10px', borderBottom: '2px solid #e3e8ee', textAlign: 'left', fontSize: 15, color: '#333', fontWeight: 700 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking: any, idx: number) => (
              <tr
                key={booking.id}
                style={{
                  background: idx % 2 === 0 ? '#fff' : '#f6fafd',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#eaf4ff')}
                onMouseOut={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#f6fafd')}
              >
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee', fontWeight: 600, color: '#222' }}>{idx + 1}</td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee', fontWeight: 600, color: '#1a237e' }}>{booking.listingTitle || 'Listing #' + booking.listing_id}</td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee', color: '#374151' }}>{booking.user_id}</td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee', color: '#222', fontWeight: 500 }}>{booking.check_in_date}</td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee', color: '#222', fontWeight: 500 }}>{booking.check_out_date}</td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee' }}>
                  <span style={{
                    color:
                      booking.status === 'CONFIRMED'
                        ? '#219653'
                        : booking.status === 'CANCELLED'
                        ? '#d32f2f'
                        : '#555',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}>{booking.status}</span>
                </td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee', fontWeight: 700, color: '#222' }}>${booking.total_price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && bookings.length === 0 && <div style={{ padding: 32, color: '#888', textAlign: 'center' }}>No bookings found.</div>}
      </div>
    </div>
  );
}
