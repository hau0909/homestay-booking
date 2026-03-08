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

  // Đã xóa chức năng Booking Experience
}
