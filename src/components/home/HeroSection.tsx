"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Calendar from "./Calendar";
import GuestSelector from "./GuestSelector";

export default function HeroSection() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [calendarType, setCalendarType] = useState<"checkIn" | "checkOut">(
    "checkIn",
  );
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guestCounts, setGuestCounts] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatGuestText = () => {
    const totalGuests = guestCounts.adults + guestCounts.children;
    const parts = [];

    if (totalGuests > 0) {
      parts.push(`${totalGuests} guest${totalGuests > 1 ? "s" : ""}`);
    }
    if (guestCounts.infants > 0) {
      parts.push(
        `${guestCounts.infants} infant${guestCounts.infants > 1 ? "s" : ""}`,
      );
    }
    if (guestCounts.pets > 0) {
      parts.push(`${guestCounts.pets} pet${guestCounts.pets > 1 ? "s" : ""}`);
    }

    return parts.join(", ") || "";
  };

  const handleGuestsChange = (guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  }) => {
    setGuestCounts(guests);
  };

  const handleDateSelect = (date: Date) => {
    if (calendarType === "checkIn") {
      setCheckInDate(date);
      // Nếu check out date đã chọn và nhỏ hơn check in mới, reset check out
      if (checkOutDate && date > checkOutDate) {
        setCheckOutDate(null);
      }
    } else {
      setCheckOutDate(date);
    }
    setShowCalendar(false);
  };

  const handleCheckInClick = () => {
    setCalendarType("checkIn");
    setShowCalendar(true);
    setShowGuestSelector(false);
  };

  const handleCheckOutClick = () => {
    setCalendarType("checkOut");
    setShowCalendar(true);
    setShowGuestSelector(false);
  };

  const handleGuestClick = () => {
    setShowGuestSelector(!showGuestSelector);
    setShowCalendar(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
      if (
        guestRef.current &&
        !guestRef.current.contains(event.target as Node)
      ) {
        setShowGuestSelector(false);
      }
    };

    if (showCalendar || showGuestSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar, showGuestSelector]);

  return (
    <section className="relative h-[600px] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/banner.jpg"
          alt="Hero Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end pb-12 px-6">
        {/* Search Card */}
        <div
          className="relative w-full max-w-6xl rounded-4xl p-8"
          ref={calendarRef}
        >
          {/* Search Form */}
          <div className="flex items-center rounded-full bg-white shadow-md">
            {/* Location */}
            <div className="flex-1 px-6 py-4 transition-all duration-300 hover:bg-gray-200 hover:rounded-full rounded-l-full cursor-pointer">
              <label className="mb-1 block text-sm font-semibold text-black">
                Location
              </label>
              <input
                type="text"
                placeholder="Which city do you prefer?"
                className="w-full text-sm text-black placeholder:text-gray-500 focus:outline-none bg-transparent cursor-pointer"
              />
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-[#90C67C]"></div>

            {/* Check In */}
            <div
              onClick={handleCheckInClick}
              className="flex-1 px-6 py-4 transition-all duration-300 hover:bg-gray-200 hover:rounded-full cursor-pointer"
            >
              <label className="mb-1 block text-sm font-semibold text-black">
                Check In
              </label>
              <input
                type="text"
                placeholder="Add Dates"
                value={formatDate(checkInDate)}
                readOnly
                className={`w-full text-sm ${checkInDate ? "text-black font-medium" : "text-gray-500"} placeholder:text-gray-500 focus:outline-none bg-transparent cursor-pointer`}
              />
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-[#90C67C]"></div>

            {/* Check Out */}
            <div
              onClick={handleCheckOutClick}
              className="flex-1 px-6 py-4 transition-all duration-300 hover:bg-gray-200 hover:rounded-full cursor-pointer"
            >
              <label className="mb-1 block text-sm font-semibold text-black">
                Check Out
              </label>
              <input
                type="text"
                placeholder="Add Dates"
                value={formatDate(checkOutDate)}
                readOnly
                className={`w-full text-sm ${checkOutDate ? "text-black font-medium" : "text-gray-500"} placeholder:text-gray-500 focus:outline-none bg-transparent cursor-pointer`}
              />
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-[#90C67C]"></div>

            {/* Guests and Search Button Wrapper */}
            <div
              className="relative flex items-center flex-1 transition-all duration-300 hover:bg-gray-200 hover:rounded-full rounded-r-full cursor-pointer"
              ref={guestRef}
            >
              {/* Guests */}
              <div onClick={handleGuestClick} className="flex-1 px-6 py-4">
                <label className="mb-1 block text-sm font-semibold text-black">
                  Guests
                </label>
                <input
                  type="text"
                  placeholder="Add Guests"
                  value={formatGuestText()}
                  readOnly
                  className={`w-full text-sm ${formatGuestText() ? "text-black font-medium" : "text-gray-500"} placeholder:text-gray-500 focus:outline-none bg-transparent cursor-pointer`}
                />
              </div>

              {/* Search Button */}
              <button className="mr-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#328E6E] text-white transition-all duration-300 hover:bg-[#67AE6E] hover:scale-105">
                <Search size={24} />
              </button>

              {/* Guest Selector Dropdown */}
              {showGuestSelector && (
                <GuestSelector
                  onClose={() => setShowGuestSelector(false)}
                  onGuestsChange={handleGuestsChange}
                  initialValues={guestCounts}
                />
              )}
            </div>
          </div>

          {/* Calendar Popup */}
          {showCalendar && (
            <Calendar
              onClose={() => setShowCalendar(false)}
              onDateSelect={handleDateSelect}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              calendarType={calendarType}
            />
          )}
        </div>
      </div>
    </section>
  );
}
