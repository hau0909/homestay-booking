"use client";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { isWeekend } from "@/src/utils/isWeekend";
import { Dispatch, SetStateAction } from "react";

interface CalendarReviewProps {
  blockedDates: Date[];
  setBlockedDates: Dispatch<SetStateAction<Date[]>>;

  currentCalendar: Date;
  setCurrentCalendar: Dispatch<SetStateAction<Date>>;

  blockedDatesFromDB: Date[];
  unavailableDates: Date[];

  price: {
    weekday: number;
    weekend: number;
  };

  isBlocking: boolean;
  onBlockDates: () => void;
}

export default function CalendarReview({
  blockedDates,
  setBlockedDates,
  currentCalendar,
  setCurrentCalendar,
  blockedDatesFromDB,
  unavailableDates,
  price,
  isBlocking,
  onBlockDates,
}: CalendarReviewProps) {
  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <Calendar
          mode="multiple"
          selected={blockedDates}
          onSelect={(dates) => {
            setBlockedDates(dates ?? []);
          }}
          month={currentCalendar}
          onMonthChange={setCurrentCalendar}
          disabled={{ before: today }}
          captionLayout="dropdown"
          required={false}
          className="w-full"
          numberOfMonths={1}
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              const isBlocked = blockedDatesFromDB.some((d) =>
                isSameDay(d, day.date),
              );

              const isunavailable =
                !isBlocked &&
                unavailableDates.some((d) => isSameDay(d, day.date));

              return (
                <CalendarDayButton
                  day={day}
                  modifiers={modifiers}
                  disabled={isBlocked}
                  {...props}
                  className={`
                    relative flex flex-col items-center justify-center
                    transition gap-5
                    ${
                      isBlocked
                        ? "bg-muted text-muted-foreground"
                        : "hover:bg-accent"
                    }
                  `}
                >
                  {children}

                  {/* Price */}
                  {!modifiers.outside && (
                    <span className="text-[10px] leading-none">
                      {isWeekend(day.date)
                        ? `$${price.weekend}`
                        : `$${price.weekday}`}
                    </span>
                  )}

                  {/* Status Dot */}
                  {!modifiers.outside && (
                    <span
                      className={`
                        absolute bottom-1 h-1.5 w-1.5 rounded-full
                        ${
                          isBlocked
                            ? "bg-red-500"
                            : isunavailable
                              ? "bg-yellow-400"
                              : "bg-green-500"
                        }
                      `}
                    />
                  )}
                </CalendarDayButton>
              );
            },
          }}
        />
      </div>

      {/* Legend + Action */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 text-xs">
          {[
            { label: "Available", color: "bg-green-500" },
            { label: "Unavailable", color: "bg-yellow-400" },
            { label: "Blocked", color: "bg-red-500" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1 rounded-full border bg-gray-50 px-3 py-1"
            >
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>

        <Button
          disabled={!blockedDates || blockedDates.length <= 0 || isBlocking}
          onClick={onBlockDates}
          className="bg-red-600 rounded-full hover:bg-red-600/70 cursor-pointer"
        >
          {isBlocking ? "Blocking..." : "Block dates"}
        </Button>
      </div>
    </div>
  );
}
