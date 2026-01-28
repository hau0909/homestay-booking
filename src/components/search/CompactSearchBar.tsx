"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Calendar from "../home/Calendar";
import GuestSelector from "../home/GuestSelector";
import LocationSelector from "../home/LocationSelector";
import { Province } from "@/src/types/location";
import { getAllProvinces } from "@/src/services/location/getAllProvinces";

export default function CompactSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [calendarType, setCalendarType] = useState<"checkIn" | "checkOut">("checkIn");
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [guestCounts, setGuestCounts] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatGuestText = () => {
    const totalGuests = guestCounts.adults + guestCounts.children;
    if (totalGuests === 0) return "";
    return `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`;
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
    setShowLocationSelector(false);
  };

  const handleCheckOutClick = () => {
    setCalendarType("checkOut");
    setShowCalendar(true);
    setShowGuestSelector(false);
    setShowLocationSelector(false);
  };

  const handleGuestClick = () => {
    setShowGuestSelector(!showGuestSelector);
    setShowCalendar(false);
    setShowLocationSelector(false);
  };

  const handleLocationClick = () => {
    setShowLocationSelector(!showLocationSelector);
    setShowCalendar(false);
    setShowGuestSelector(false);
  };

  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province);
    setLocationSearch(province.name);
    setShowLocationSelector(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedProvince) params.set("province", selectedProvince.code);
    if (checkInDate) params.set("checkIn", checkInDate.toISOString().split("T")[0]);
    if (checkOutDate) params.set("checkOut", checkOutDate.toISOString().split("T")[0]);
    const totalGuests = guestCounts.adults + guestCounts.children;
    if (totalGuests > 0) params.set("guests", totalGuests.toString());

    router.push(`/search?${params.toString()}`);
  };

  // Initialize from URL params
  useEffect(() => {
    const provinceCode = searchParams.get("province");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const guestsParam = searchParams.get("guests");

    if (checkInParam) setCheckInDate(new Date(checkInParam));
    if (checkOutParam) setCheckOutDate(new Date(checkOutParam));
    if (guestsParam) {
      const total = parseInt(guestsParam);
      setGuestCounts({ adults: total, children: 0, infants: 0, pets: 0 });
    }

    // Fetch provinces and set selected
    getAllProvinces().then((data) => {
      setProvinces(data);
      if (provinceCode) {
        const found = data.find((p) => p.code === provinceCode);
        if (found) {
          setSelectedProvince(found);
          setLocationSearch(found.name);
        }
      }
    });
  }, [searchParams]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuestSelector(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSelector(false);
      }
    };

    if (showCalendar || showGuestSelector || showLocationSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar, showGuestSelector, showLocationSelector]);

  return (
    <div className="flex items-center justify-center" ref={calendarRef}>
      {/* Compact Search Bar */}
      <div className="flex items-center rounded-full border border-gray-300 shadow-sm hover:shadow-md transition-shadow bg-white">
        {/* Location */}
        <div
          className="relative px-4 py-2 cursor-pointer border-r border-gray-200 min-w-[140px]"
          ref={locationRef}
          onClick={handleLocationClick}
        >
          <input
            type="text"
            placeholder="Location"
            value={locationSearch}
            onChange={(e) => {
              setLocationSearch(e.target.value);
              setShowLocationSelector(true);
              setSelectedProvince(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowLocationSelector(true);
            }}
            className="w-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none bg-transparent"
          />

          {showLocationSelector && (
            <LocationSelector
              provinces={provinces}
              onSelect={handleProvinceSelect}
              onClose={() => setShowLocationSelector(false)}
              searchValue={locationSearch}
            />
          )}
        </div>

        {/* Check In */}
        <div
          onClick={handleCheckInClick}
          className="px-4 py-2 cursor-pointer border-r border-gray-200 min-w-[100px]"
        >
          <input
            type="text"
            placeholder="Check In"
            value={formatDate(checkInDate)}
            readOnly
            className="w-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none bg-transparent cursor-pointer"
          />
        </div>

        {/* Check Out */}
        <div
          onClick={handleCheckOutClick}
          className="px-4 py-2 cursor-pointer border-r border-gray-200 min-w-[100px]"
        >
          <input
            type="text"
            placeholder="Check Out"
            value={formatDate(checkOutDate)}
            readOnly
            className="w-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none bg-transparent cursor-pointer"
          />
        </div>

        {/* Guests */}
        <div
          className="relative px-4 py-2 cursor-pointer min-w-[100px]"
          ref={guestRef}
          onClick={handleGuestClick}
        >
          <input
            type="text"
            placeholder="Guests"
            value={formatGuestText()}
            readOnly
            className="w-full text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none bg-transparent cursor-pointer"
          />

          {showGuestSelector && (
            <GuestSelector
              onClose={() => setShowGuestSelector(false)}
              onGuestsChange={handleGuestsChange}
              initialValues={guestCounts}
            />
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="m-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#328E6E] text-white hover:bg-[#67AE6E] transition-colors"
        >
          <Search size={16} />
        </button>
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
  );
}
