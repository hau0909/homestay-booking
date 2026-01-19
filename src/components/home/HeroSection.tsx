"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Calendar from "./Calendar";
import GuestSelector from "./GuestSelector";

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("Rooms");
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
  const tabs = ["Rooms", "Flats", "Hotels", "Villas"];

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset all search fields when tab changes
    setCheckInDate(null);
    setCheckOutDate(null);
    setGuestCounts({
      adults: 0,
      children: 0,
      infants: 0,
      pets: 0,
    });
    setShowCalendar(false);
    setShowGuestSelector(false);
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
          src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070"
          alt="Hero Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end pb-12 px-6">
        {/* Search Card */}
        <div
          className="relative w-full max-w-6xl rounded-4xl p-8 bg-white"
          ref={calendarRef}
        >
          {/* FIND Title and Tabs */}
          <div className="mb-6 flex items-center gap-12">
            <h2 className="text-4xl font-bold text-black">FIND</h2>
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`text-lg font-bold transition-colors relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 ${
                    activeTab === tab
                      ? "text-gray-900 after:w-full"
                      : "text-gray-500 hover:text-gray-700 after:w-0 hover:after:w-full"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="flex items-center rounded-full bg-white shadow-md">
            {/* Location */}
            <div className="flex-1 px-6 py-4 transition-all duration-300 hover:bg-gray-100 hover:rounded-full rounded-l-full cursor-pointer">
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Location
              </label>
              <input
                type="text"
                placeholder="Which city do you prefer?"
                className="w-full text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none bg-transparent cursor-pointer"
              />
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-gray-200"></div>

            {/* Check In */}
            <div
              onClick={handleCheckInClick}
              className="flex-1 px-6 py-4 transition-all duration-300 hover:bg-gray-100 hover:rounded-full cursor-pointer"
            >
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Check In
              </label>
              <input
                type="text"
                placeholder="Add Dates"
                value={formatDate(checkInDate)}
                readOnly
                className={`w-full text-sm ${checkInDate ? "text-gray-900 font-medium" : "text-gray-400"} placeholder:text-gray-400 focus:outline-none bg-transparent cursor-pointer`}
              />
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-gray-200"></div>

            {/* Check Out */}
            <div
              onClick={handleCheckOutClick}
              className="flex-1 px-6 py-4 transition-all duration-300 hover:bg-gray-100 hover:rounded-full cursor-pointer"
            >
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Check Out
              </label>
              <input
                type="text"
                placeholder="Add Dates"
                value={formatDate(checkOutDate)}
                readOnly
                className={`w-full text-sm ${checkOutDate ? "text-gray-900 font-medium" : "text-gray-400"} placeholder:text-gray-400 focus:outline-none bg-transparent cursor-pointer`}
              />
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-gray-200"></div>

            {/* Guests and Search Button Wrapper */}
            <div
              className="relative flex items-center flex-1 transition-all duration-300 hover:bg-gray-100 hover:rounded-full rounded-r-full cursor-pointer"
              ref={guestRef}
            >
              {/* Guests */}
              <div onClick={handleGuestClick} className="flex-1 px-6 py-4">
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Guests
                </label>
                <input
                  type="text"
                  placeholder="Add Guests"
                  value={formatGuestText()}
                  readOnly
                  className={`w-full text-sm ${formatGuestText() ? "text-gray-900 font-medium" : "text-gray-400"} placeholder:text-gray-400 focus:outline-none bg-transparent cursor-pointer`}
                />
              </div>

              {/* Search Button */}
              <button className="mr-2 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-white transition-all duration-300 hover:bg-gray-900 hover:scale-105">
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
