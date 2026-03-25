"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";


import BookingActions from "@/src/components/booking/BookingActions";
import EditBookingStatusModal from "@/src/components/booking/EditBookingStatusModal";
import BookingViewModal from "@/src/components/booking/BookingViewModal";
import ExperienceBookingActions from "@/src/components/hosting/ExperienceBookingActions";
import ExperienceBookingViewModal from "@/src/components/hosting/ExperienceBookingViewModal";

interface Booking {
  id: string;
  listing_id: string;
  user_id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_price: number;
  payment_status?: string;
  listingTitle?: string;
  listingType?: string;
}


export default function Page() {
  const [activeTab, setActiveTab] = useState<"HOME" | "EXPERIENCE">("HOME");
  // Home bookings state
  const [editModal, setEditModal] = useState<{
    open: boolean;
    bookingId?: string;
    status?: string;
    listing_id?: string;
    total_price?: number;
  } | null>(null);
  const [viewModal, setViewModal] = useState<{
    open: boolean;
    booking: Booking | null;
    listing: any | null;
  } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Home bookings status filter
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  // Experience bookings state
  const [expBookings, setExpBookings] = useState<any[]>([]);
  const [filteredExpBookings, setFilteredExpBookings] = useState<any[]>([]);
  const [expLoading, setExpLoading] = useState(true);
  const [expError, setExpError] = useState("");
  const [expStatusFilter, setExpStatusFilter] = useState("PENDING");
  const [expViewModal, setExpViewModal] = useState<any | null>(null);
  const statusOptions = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

  // Hàm cập nhật trạng thái booking lên DB
  const handleUpdateStatus = async (
    bookingId: string,
    newStatus: string,
    totalPrice?: number,
  ) => {
    // Gọi API update trạng thái booking
    const updateData: any = { status: newStatus };
    if (totalPrice !== undefined) {
      updateData.total_price = totalPrice;
    }
    if (newStatus === "COMPLETED") {
      updateData.payment_status = "PAID";
    }
    const { data: updateBooking } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId)
      .select("id, user_id")
      .single();

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
        id,
        full_name,
        email
      )
    )
  `,
      )
      .eq("id", bookingId)
      .single();

    const listing = Array.isArray(booking?.listing)
      ? booking.listing[0]
      : booking?.listing;
    if (!error && updateBooking) {
      if (newStatus === "CONFIRMED") {
        await supabase.from("notifications").insert({
          user_id: updateBooking.user_id,
          title: "Booking Confirmed",
          message: `Your ${listing?.title} listing has been confirmed by the host!`,
          type: "CONFIRM",
          is_read: false,
        });
      }

      if (newStatus === "CANCELLED") {
        await supabase.from("notifications").insert({
          user_id: updateBooking.user_id,
          title: "Booking Cancelled",
          message: `Your ${listing?.title} listing has been cancelled!`,
          type: "CANCEL",
          is_read: false,
        });
      }

      setFilteredBookings((prev: Booking[]) =>
        prev.map((b: Booking) =>
          b.id === bookingId
            ? {
                ...b,
                status: newStatus,
                total_price: totalPrice ?? b.total_price,
                payment_status: newStatus === "COMPLETED" ? "PAID" : b.payment_status,
              }
            : b,
        ),
      );
      setBookings((prev: Booking[]) =>
        prev.map((b: Booking) =>
          b.id === bookingId
            ? {
                ...b,
                status: newStatus,
                total_price: totalPrice ?? b.total_price,
                payment_status: newStatus === "COMPLETED" ? "PAID" : b.payment_status,
              }
            : b,
        ),
      );
      if (newStatus === "COMPLETED") {
        await fetch("/api/review-alert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
          }),
        });
      }
      if (newStatus === "CONFIRMED") {
        await fetch("/api/confirm-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
          }),
        });
      }
    } else {
      alert("Cập nhật trạng thái thất bại!");
    }

    setEditModal(null);
  };


  // Fetch Home bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) throw new Error("Not authenticated");
        const hostId = userData.user.id;
        const { data: listings, error: listingsError } = await supabase
          .from("listings")
          .select("id, title, listing_type")
          .eq("host_id", hostId);
        if (listingsError) throw listingsError;
        const listingMap: Record<string, string> = {};
        const listingTypeMap: Record<string, string> = {};
        (listings || []).forEach((l: any) => {
          listingMap[l.id] = l.title;
          listingTypeMap[l.id] = l.listing_type;
        });
        const listingIds = (listings || []).map((l: any) => l.id);
        let bookingsData: Booking[] = [];
        if (listingIds.length > 0) {
          const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select("*")
            .in("listing_id", listingIds)
            .is("experience_slot_id", null);
          if (bookingsError) throw bookingsError;
          bookingsData = (bookings || []).map((b: any) => ({
            ...b,
            listingTitle: listingMap[b.listing_id],
            listingType: listingTypeMap[b.listing_id] || "HOME",
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

  // Fetch Experience bookings
  useEffect(() => {
    const fetchExpBookings = async () => {
      setExpLoading(true);
      setExpError("");
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) throw new Error("Not authenticated");
        const hostId = userData.user.id;
        // 1. Lấy tất cả listing EXPERIENCE của host
        const { data: listings, error: listingsError } = await supabase
          .from("listings")
          .select("id")
          .eq("host_id", hostId)
          .eq("listing_type", "EXPERIENCE");
        if (listingsError) throw listingsError;
        const listingIds = (listings || []).map((l: any) => l.id);

        // 2. Lấy bookings EXPERIENCE (có experience_slot_id khác null), join experience_slots để lấy start_time/end_time
        let expBookingsData: any[] = [];
        if (listingIds.length > 0) {
          const { data: bookings, error: bookingsError } = await supabase
            .from("bookings")
            .select(`*, profiles:profiles!bookings_user_id_fkey(full_name, email, phone), experience_slot:experience_slots!bookings_experience_slot_id_fkey(start_time, end_time)`)
            .in("listing_id", listingIds)
            .not("experience_slot_id", "is", null)
            .order("created_at", { ascending: false });
          if (bookingsError) throw bookingsError;
          expBookingsData = (bookings || []).map((b: any) => ({
            ...b,
            profile_name: b.profiles?.full_name,
            email: b.profiles?.email,
            phone: b.profiles?.phone,
            slot_start_time: b.experience_slot?.start_time,
            slot_end_time: b.experience_slot?.end_time,
          }));
        }
        setExpBookings(expBookingsData);
      } catch (err: any) {
        setExpError(err.message || "Unknown error");
      } finally {
        setExpLoading(false);
      }
    };
    fetchExpBookings();
  }, []);


  // Filter bookings for Home tab
  useEffect(() => {
    if (activeTab === "HOME") {
      let result = bookings.filter((b) => b.listingType === "HOME");
      if (selectedStatus === "ALL") {
        setFilteredBookings(result);
      } else {
        setFilteredBookings(result.filter((b: any) => b.status === selectedStatus));
      }
    }
  }, [selectedStatus, bookings, activeTab]);

  // Filter bookings for Experience tab
  useEffect(() => {
    if (activeTab === "EXPERIENCE") {
      if (expStatusFilter === "ALL") {
        setFilteredExpBookings(expBookings);
      } else {
        setFilteredExpBookings(expBookings.filter((b: any) => b.status === expStatusFilter));
      }
    }
  }, [expStatusFilter, expBookings, activeTab]);

  return (
    <div style={{ background: "#f7fafd", minHeight: "100vh", padding: "32px" }}>
      <div style={{ display: "flex", gap: "24px", marginBottom: "24px", borderBottom: "2px solid #e3e8ee" }}>
        <button
          onClick={() => setActiveTab("HOME")}
          style={{
            background: "none",
            border: "none",
            padding: "12px 0",
            fontSize: "18px",
            fontWeight: activeTab === "HOME" ? 700 : 500,
            color: activeTab === "HOME" ? "#328E6E" : "#6b7280",
            borderBottom: activeTab === "HOME" ? "3px solid #328E6E" : "3px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab("EXPERIENCE")}
          style={{
            background: "none",
            border: "none",
            padding: "12px 0",
            fontSize: "18px",
            fontWeight: activeTab === "EXPERIENCE" ? 700 : 500,
            color: activeTab === "EXPERIENCE" ? "#328E6E" : "#6b7280",
            borderBottom: activeTab === "EXPERIENCE" ? "3px solid #328E6E" : "3px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Experiences
        </button>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18, color: "#222", letterSpacing: 0.2 }}>
        All Bookings for Your {activeTab === "HOME" ? "Homes" : "Experiences"}
      </h1>

      {/* Status Filter Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {statusOptions.map((status) => {
          // Always use selectedStatus for HOME, expStatusFilter for EXPERIENCE
          const isSelected = activeTab === "HOME" ? selectedStatus === status : expStatusFilter === status;
          return (
            <button
              key={status}
              onClick={() => activeTab === "HOME" ? setSelectedStatus(status) : setExpStatusFilter(status)}
              style={{
                padding: "6px 18px",
                borderRadius: "6px",
                border: isSelected ? "1.5px solid #328E6E" : "1px solid #e3e8ee",
                background: isSelected ? "#328E6E" : "#fff",
                color: isSelected ? "#fff" : "#222",
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: 0.2,
                boxShadow: isSelected ? "0 2px 8px #328e6e22" : "none",
                cursor: "pointer",
                minWidth: 110,
                transition: "all 0.18s",
              }}
              onMouseOver={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "#f5f7fa";
                }
              }}
              onMouseOut={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "#fff";
                }
              }}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* HOME TAB TABLE */}
      {activeTab === "HOME" && (
        <>
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
          <div style={{ overflowX: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1.5px solid #e3e8ee", padding: 8 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 900, fontFamily: "inherit" }}>
              <thead style={{ background: "#f0f4f8" }}>
                <tr>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>#</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Listing</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Guest</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Check-in</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Check-out</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Total</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "center", fontSize: 15, color: "#333", fontWeight: 700, minWidth: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking: any, idx: number) => (
                  <tr
                    key={booking.id}
                    style={{ background: idx % 2 === 0 ? "#fff" : "#f6fafd", transition: "background 0.2s", cursor: "pointer" }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#eaf4ff")}
                    onMouseOut={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f6fafd")}
                  >
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 600, color: "#222" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 600, color: "#1a237e" }}>{booking.listingTitle || "Listing #" + booking.listing_id}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#374151" }}>{booking.user_id}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#222", fontWeight: 500 }}>{booking.check_in_date}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#222", fontWeight: 500 }}>{booking.check_out_date}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee" }}>
                      <span style={{ color: booking.status === "CONFIRMED" ? "#219653" : booking.status === "CANCELLED" ? "#d32f2f" : booking.status === "COMPLETED" ? "#1976d2" : booking.status === "PENDING" ? "#ff9800" : "#555", fontWeight: 700, letterSpacing: 0.5 }}>{booking.status}</span>
                    </td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 700, color: "#222" }}>${booking.total_price}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", textAlign: "right", minWidth: 120 }}>
                      <BookingActions
                        status={booking.status}
                        onView={async () => {
                          const { data: listing } = await supabase.from("listings").select("*").eq("id", booking.listing_id).single();
                          const { data: home } = await supabase.from("homes").select("max_guests, price_weekday, price_weekend").eq("listing_id", booking.listing_id).single();
                          let userInfo: Record<string, any> = {};
                          const { data: userProfile } = await supabase.from("profiles").select("full_name, email, phone").eq("id", booking.user_id).single();
                          if (userProfile) {
                            userInfo = {
                              guest_name: userProfile.full_name,
                              guest_email: userProfile.email,
                              guest_phone: userProfile.phone,
                              guest_address: undefined,
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
                        onEdit={booking.status === "PENDING" || booking.status === "CONFIRMED" ? () => setEditModal({ open: true, bookingId: booking.id, status: booking.status, listing_id: booking.listing_id, total_price: booking.total_price }) : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filteredBookings.length === 0 && (
              <div style={{ padding: 32, color: "#888", textAlign: "center" }}>No bookings found for selected status.</div>
            )}
          </div>
          {/* Modal cập nhật trạng thái booking */}
          <EditBookingStatusModal
            open={!!editModal?.open}
            onClose={() => setEditModal(null)}
            onSelect={(status, totalPrice) => editModal?.bookingId && handleUpdateStatus(editModal.bookingId, status, totalPrice)}
            currentStatus={editModal?.status}
            listing_id={editModal?.listing_id}
            total_price={editModal?.total_price}
          />
          {/* Modal xem chi tiết booking */}
          <BookingViewModal
            open={!!viewModal?.open}
            onClose={() => setViewModal(null)}
            booking={viewModal?.booking || null}
            listing={viewModal?.listing || null}
          />
        </>
      )}

      {/* EXPERIENCE TAB TABLE */}
      {activeTab === "EXPERIENCE" && (
        <>
          {expLoading && <div>Loading...</div>}
          {expError && <div style={{ color: "red", marginBottom: 16 }}>{expError}</div>}
          <div style={{ overflowX: "auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1.5px solid #e3e8ee", padding: 8 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 900, fontFamily: "inherit" }}>
              <thead style={{ background: "#f0f4f8" }}>
                <tr>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>#</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Guest</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Check-in</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Check-out</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "left", fontSize: 15, color: "#333", fontWeight: 700 }}>Total</th>
                  <th style={{ padding: "14px 10px", borderBottom: "2px solid #e3e8ee", textAlign: "center", fontSize: 15, color: "#333", fontWeight: 700, minWidth: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpBookings.map((booking: any, idx: number) => (
                  <tr
                    key={booking.id}
                    style={{ background: idx % 2 === 0 ? "#fff" : "#f6fafd", transition: "background 0.2s", cursor: "pointer" }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#eaf4ff")}
                    onMouseOut={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f6fafd")}
                  >
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 600, color: "#222" }}>{idx + 1}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 600, color: "#1976d2" }}>{booking.profile_name || booking.user_id}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#222", fontWeight: 500 }}>{booking.slot_start_time ? new Date(booking.slot_start_time).toLocaleDateString('en-CA') : ''}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", color: "#222", fontWeight: 500 }}>{booking.slot_end_time ? new Date(booking.slot_end_time).toLocaleDateString('en-CA') : ''}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee" }}>
                      <span style={{ color: booking.status === "CONFIRMED" ? "#219653" : booking.status === "CANCELLED" ? "#d32f2f" : booking.status === "COMPLETED" ? "#1976d2" : booking.status === "PENDING" ? "#ff9800" : "#555", fontWeight: 700, letterSpacing: 0.5 }}>{booking.status}</span>
                    </td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", fontWeight: 700, color: "#222" }}>${booking.total_price || booking.price}</td>
                    <td style={{ padding: "12px 10px", borderBottom: "1px solid #e3e8ee", textAlign: "right", minWidth: 120 }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <ExperienceBookingActions booking={booking} statusFilter={expStatusFilter} />
                        <button
                          style={{ padding: '8px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #1976d233', transition: 'background 0.18s, box-shadow 0.18s' }}
                          onClick={async () => {
                            // Lấy thông tin listing EXPERIENCE
                            let listingTitle = '';
                            if (booking.listing_id) {
                              const { data: listing } = await supabase
                                .from('listings')
                                .select('title')
                                .eq('id', booking.listing_id)
                                .single();
                              listingTitle = listing?.title || '';
                            }
                            setExpViewModal({ ...booking, listingTitle });
                          }}
                        >View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!expLoading && filteredExpBookings.length === 0 && (
              <div style={{ padding: 32, color: "#888", textAlign: "center" }}>No bookings found for selected status.</div>
            )}
          </div>
          {/* Modal xem chi tiết booking Experience */}
          <ExperienceBookingViewModal open={!!expViewModal} booking={expViewModal} onClose={() => setExpViewModal(null)} />
        </>
      )}
    </div>
  );
}
