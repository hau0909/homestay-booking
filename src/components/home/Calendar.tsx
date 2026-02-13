"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CalendarProps {
  onClose?: () => void;
  onDateSelect?: (date: Date) => void;
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  calendarType?: "checkIn" | "checkOut";
}

export default function Calendar({
  onClose,
  onDateSelect,
  checkInDate,
  checkOutDate,
  calendarType,
}: CalendarProps) {
  const [activeTab, setActiveTab] = useState("Dates");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // January 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const tabs = ["Dates"];
  const quickDays = [
    "Exact dates",
    "± 1 day",
    "± 2 days",
    "± 3 days",
    "± 7 days",
    "± 14 days",
  ];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return date.getTime() === selectedDate.getTime();
  };

  const isDisabledDate = (date: Date) => {
    // Disable ngày đã chọn ở phía còn lại
    if (calendarType === "checkIn" && checkOutDate) {
      return date.getTime() === checkOutDate.getTime();
    }
    if (calendarType === "checkOut" && checkInDate) {
      return date.getTime() === checkInDate.getTime();
    }
    return false;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const renderCalendar = (monthOffset: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + monthOffset,
      1,
    );
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(date);
    const monthName = date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const days = [];
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
   for (let day = 1; day <= daysInMonth; day++) {
  const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
  // Thay vì 0, 0, 0, 0 hãy đặt là 12, 0, 0, 0
  currentDate.setHours(12, 0, 0, 0); 

  const today = new Date();
  today.setHours(12, 0, 0, 0); 
  
  const isPast = currentDate < today;
  const isSelected = isSelectedDate(currentDate);
  const isDisabled = isDisabledDate(currentDate);

  // Khi gửi dữ liệu đi hoặc log ra:
  console.log(currentDate.toISOString().split('T')[0]);

      days.push(
        <button
          key={day}
          onClick={() => !isPast && !isDisabled && handleDateClick(currentDate)}
          disabled={isPast || isDisabled}
          className={`p-2 text-center transition-all duration-200 relative min-w-[40px] min-h-[40px] flex items-center justify-center ${
            isSelected
              ? "bg-[#328E6E] text-white rounded-full font-semibold"
              : isPast || isDisabled
                ? "text-[#E1EEBC] cursor-not-allowed"
                : "text-[#328E6E] hover:bg-[#E1EEBC] rounded-full font-medium"
          }`}
        >
          {day}
        </button>,
      );
    }

    return (
      <div
        className={`flex-1 ${direction === "left" ? "animate-slide-left" : "animate-slide-right"}`}
        key={`${date.getFullYear()}-${date.getMonth()}-${monthOffset}`}
      >
        <h3 className="mb-6 text-center text-xl font-semibold text-[#328E6E]">
          {monthName}
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="p-2 text-center text-sm font-medium text-[#67AE6E]"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-4 rounded-3xl bg-white p-8 shadow-2xl z-50">
      {/* Tabs */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full bg-[#E1EEBC] p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? "bg-white text-[#328E6E] shadow-sm"
                  : "text-[#67AE6E] hover:text-[#328E6E]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Navigation and Grid */}
      <div className="mb-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => {
              setDirection("left");
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1,
                ),
              );
            }}
            className="rounded-full p-2 hover:bg-[#E1EEBC] transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Two Months */}
          <div className="flex flex-1 gap-16">
            {renderCalendar(0)}
            {renderCalendar(1)}
          </div>

          <button
            onClick={() => {
              setDirection("right");
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1,
                ),
              );
            }}
            className="rounded-full p-2 hover:bg-[#E1EEBC] transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
