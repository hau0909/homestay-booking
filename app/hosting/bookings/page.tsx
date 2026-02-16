

"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";



import BookingActions from "@/src/components/booking/BookingActions";
import EditBookingStatusModal from "@/src/components/booking/EditBookingStatusModal";
import BookingViewModal from "@/src/components/booking/BookingViewModal";



interface Booking {
  id: string;
  listing_id: string;
  user_id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
  listingTitle?: string;
}


export default function Page() {
  const [editModal, setEditModal] = useState<{ open: boolean; bookingId?: string } | null>(null);
  const [viewModal, setViewModal] = useState<{ open: boolean; booking: Booking | null; listing: any | null } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const statusOptions = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

  // Hàm cập nhật trạng thái booking lên DB
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    // Gọi API update trạng thái booking
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);
    if (!error) {
      setFilteredBookings((prev: Booking[]) => prev.map((b: Booking) => b.id === bookingId ? { ...b, status: newStatus } : b));
      setBookings((prev: Booking[]) => prev.map((b: Booking) => b.id === bookingId ? { ...b, status: newStatus } : b));
    } else {
      alert("Cập nhật trạng thái thất bại!");
    }
    setEditModal(null);
  };

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
        const listingMap: Record<string, string> = {};
        (listings || []).forEach((l: any) => { listingMap[l.id] = l.title; });
        const listingIds = (listings || []).map((l: any) => l.id);

        // 3. Lấy tất cả booking của các listing đó
        let bookingsData: Booking[] = [];
        if (listingIds.length > 0) {
          const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("*")
            .in("listing_id", listingIds);
          if (bookingsError) throw bookingsError;
          bookingsData = (bookings || []).map((b: any) => ({ ...b, listingTitle: listingMap[b.listing_id] }));
        }
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    if (selectedStatus === "ALL") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b: any) => b.status === selectedStatus));
    }
  }, [selectedStatus, bookings]);

  return (
    <div style={{ background: '#f7fafd', minHeight: '100vh', padding: '32px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18, color: '#222', letterSpacing: 0.2 }}>All Bookings for Your Listings</h1>

      {/* Status Filter Buttons - UI cải tiến */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            style={{
              padding: '6px 18px',
              borderRadius: '6px',
              border: selectedStatus === status ? '1.5px solid #328E6E' : '1px solid #e3e8ee',
              background: selectedStatus === status ? '#328E6E' : '#fff',
              color: selectedStatus === status ? '#fff' : '#222',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 0.2,
              boxShadow: selectedStatus === status ? '0 2px 8px #328e6e22' : 'none',
              cursor: 'pointer',
              minWidth: 110,
              transition: 'all 0.18s',
            }}
            onMouseOver={(e) => {
              if (selectedStatus !== status) {
                e.currentTarget.style.background = '#f5f7fa';
              }
            }}
            onMouseOut={(e) => {
              if (selectedStatus !== status) {
                e.currentTarget.style.background = '#fff';
              }
            }}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      
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
              <th style={{ padding: '14px 10px', borderBottom: '2px solid #e3e8ee', textAlign: 'center', fontSize: 15, color: '#333', fontWeight: 700, minWidth: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking: any, idx: number) => (
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
                        : booking.status === 'COMPLETED'
                        ? '#1976d2'
                        : booking.status === 'PENDING'
                        ? '#ff9800'
                        : '#555',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}>{booking.status}</span>
                </td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee', fontWeight: 700, color: '#222' }}>${booking.total_price}</td>
                <td style={{ padding: '12px 10px', borderBottom: '1px solid #e3e8ee', textAlign: 'right', minWidth: 120 }}>
                  <BookingActions
                    status={booking.status}
                    onView={async () => {
                      // Lấy thông tin phòng từ DB (listings + homes)
                      const { data: listing } = await supabase
                        .from("listings")
                        .select("*")
                        .eq("id", booking.listing_id)
                        .single();
                      const { data: home } = await supabase
                        .from("homes")
                        .select("max_guests, price_weekday, price_weekend")
                        .eq("listing_id", booking.listing_id)
                        .single();
                      // Lấy thông tin user từ DB (bảng profiles)
                      let userInfo = {};
                      const { data: userProfile } = await supabase
                        .from("profiles")
                        .select("full_name, email, phone, address")
                        .eq("id", booking.user_id)
                        .single();
                      if (userProfile) {
                        userInfo = {
                          guest_name: userProfile.full_name,
                          guest_email: userProfile.email,
                          guest_phone: userProfile.phone,
                          guest_address: userProfile.address,
                        };
                      }
                      setViewModal({
                        open: true,
                        booking: {
                          ...booking,
                          guest_name: userInfo.guest_name,
                          guest_email: userInfo.guest_email,
                          guest_phone: userInfo.guest_phone,
                          guest_address: userInfo.guest_address,
                        },
                        listing: {
                          ...listing,
                          max_guests: home?.max_guests ?? null,
                          price_weekday: home?.price_weekday ?? null,
                          price_weekend: home?.price_weekend ?? null,
                        },
                      });
                    }}
                    onEdit={booking.status === 'PENDING' ? (() => setEditModal({ open: true, bookingId: booking.id })) : undefined}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filteredBookings.length === 0 && <div style={{ padding: 32, color: '#888', textAlign: 'center' }}>No bookings found for selected status.</div>}
      </div>
      {/* Modal cập nhật trạng thái booking */}
      <EditBookingStatusModal
        open={!!editModal?.open}
        onClose={() => setEditModal(null)}
        onSelect={(status) => editModal?.bookingId && handleUpdateStatus(editModal.bookingId, status)}
      />
      {/* Modal xem chi tiết booking */}
      <BookingViewModal
        open={!!viewModal?.open}
        onClose={() => setViewModal(null)}
        booking={viewModal?.booking || null}
        listing={viewModal?.listing || null}
      />
    </div>
  );
}
