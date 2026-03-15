// trietcmce180982_sprint3
"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import ExperienceBookingActions from "@/src/components/hosting/ExperienceBookingActions";

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
    profile_name?: string;
}

export default function ExperienceBookingManagerPage() {
    const [bookings, setBookings] = useState<ExperienceBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError("");
            try {
                const { data: userData, error: userError } = await supabase.auth.getUser();
                if (userError || !userData?.user) throw new Error("Not authenticated");
                const hostId = userData.user.id;
                // Lấy tất cả listing của host
                const { data: listings, error: listingsError } = await supabase
                    .from("listings")
                    .select("id")
                    .eq("host_id", hostId);
                if (listingsError) throw listingsError;
                const listingIds = (listings || []).map((l: any) => l.id);

                // Lấy tất cả experience thuộc các listing đó
                let experiences: any[] = [];
                let expMap: Record<string, string> = {};
                if (listingIds.length > 0) {
                    const { data: expData, error: expError } = await supabase
                        .from("experiences")
                        .select("id, title, listing_id")
                        .in("listing_id", listingIds);
                    if (expError) throw expError;
                    experiences = expData || [];
                    experiences.forEach((e: any) => { expMap[e.id] = e.title; });
                }
                const expIds = experiences.map((e: any) => e.id);
                let bookingsData: ExperienceBooking[] = [];
                if (expIds.length > 0) {
                    // Lấy tất cả booking có experience_slot_id khác null, lấy thêm profile name
                    const { data: bookings, error: bookingsError } = await supabase
                        .from("bookings")
                        .select("*, experience_slot_id, total_guests, status, profiles(full_name)")
                        .not("experience_slot_id", "is", null);
                    if (bookingsError) throw bookingsError;

                    // Lấy thông tin slot cho từng booking
                    const slotIds = (bookings || []).map((b: any) => b.experience_slot_id);
                    let slotMap: Record<string, any> = {};
                    if (slotIds.length > 0) {
                        const { data: slots, error: slotsError } = await supabase
                            .from("experience_slots")
                            .select("id, start_time, end_time")
                            .in("id", slotIds);
                        if (!slotsError && slots) {
                            slots.forEach((s: any) => { slotMap[s.id] = s; });
                        }
                    }

                    bookingsData = (bookings || []).map((b: any) => ({
                        ...b,
                        experience_id: b.experience_slot_id,
                        experienceTitle: expMap[b.experience_slot_id],
                        slot_start_time: slotMap[b.experience_slot_id]?.start_time || '',
                        slot_end_time: slotMap[b.experience_slot_id]?.end_time || '',
                        attendees: b.total_guests || 1,
                        profile_name: b.profiles?.full_name || '',
                        price: b.total_price || 0,
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

    const [statusFilter, setStatusFilter] = useState('PENDING');
    const statusOptions = ['PENDING', 'CONFIRMED', 'REJECT'];
    const filteredBookings = bookings.filter(b => {
        if (statusFilter === 'PENDING') return b.status === 'PENDING';
        if (statusFilter === 'CONFIRMED') return b.status === 'CONFIRMED';
        if (statusFilter === 'REJECT') return b.status === 'REJECT';
        return false;
    });

    return (
        <div style={{ padding: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 18, textAlign: 'center' }}>Experience Booking Manager</h2>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
                {statusOptions.map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        style={{
                            padding: '10px 32px',
                            borderRadius: 12,
                            border: statusFilter === status ? 'none' : '1.5px solid #e3e8ee',
                            background: statusFilter === status ? '#339980' : '#f7fafd',
                            color: statusFilter === status ? '#fff' : '#222',
                            fontWeight: 700,
                            fontSize: 17,
                            cursor: 'pointer',
                            boxShadow: statusFilter === status ? '0 2px 8px #33998033' : 'none',
                            transition: 'all 0.18s',
                        }}
                    >
                        {status === 'REJECT' ? 'Rejected' : status.charAt(0) + status.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>
            {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', overflow: 'hidden' }}>
                        <thead>
                            <tr style={{ background: '#f7fafd', height: 48 }}>
                                <th style={{ textAlign: 'center', fontWeight: 700, color: '#222', fontSize: 16 }}>#</th>
                                <th style={{ textAlign: 'center', fontWeight: 700, color: '#222', fontSize: 16 }}>Guest</th>
                                <th style={{ textAlign: 'center', fontWeight: 700, color: '#222', fontSize: 16 }}>Check-in</th>
                                <th style={{ textAlign: 'center', fontWeight: 700, color: '#222', fontSize: 16 }}>Check-out</th>
                                <th style={{ textAlign: 'center', fontWeight: 700, color: '#222', fontSize: 16 }}>Status</th>
                                <th style={{ textAlign: 'center', fontWeight: 700, color: '#222', fontSize: 16 }}>Total</th>
                                {statusFilter === 'PENDING' && (
                                    <th style={{ textAlign: 'center', fontWeight: 700, color: '#222', fontSize: 16 }}>Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr><td colSpan={statusFilter === 'PENDING' ? 7 : 6} style={{ textAlign: 'center', padding: 24 }}>No bookings found for selected status.</td></tr>
                            ) : filteredBookings.map((booking, idx) => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #e3e8ee', height: 56 }}>
                                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#222', fontSize: 15 }}>{idx + 1}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 500, color: '#1976d2', fontSize: 15 }}>
                                        {booking.profile_name || booking.user_id}
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 500, color: '#555', fontSize: 15 }}>{booking.slot_start_time ? new Date(booking.slot_start_time).toLocaleDateString('en-CA') : ''}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 500, color: '#555', fontSize: 15 }}>{booking.slot_end_time ? new Date(booking.slot_end_time).toLocaleDateString('en-CA') : ''}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: booking.status === 'PENDING' ? '#ff9800' : booking.status === 'CONFIRMED' ? '#43a047' : '#e53935', fontSize: 15 }}>{booking.status}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#222', fontSize: 15 }}>${booking.price}</td>
                                    {statusFilter === 'PENDING' && (
                                        <td style={{ textAlign: 'center', padding: '0 8px' }}>
                                            <ExperienceBookingActions booking={booking} />
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
