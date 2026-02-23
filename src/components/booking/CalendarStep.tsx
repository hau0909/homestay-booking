"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import toast from "react-hot-toast";

interface Props {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  disabledDates: Date[];
}

const isRangeBlocked = (from: Date, to: Date, disabledDates: Date[]) => {
  const start = new Date(from);
  const end = new Date(to);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return disabledDates.some((d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);

    return date >= start && date <= end;
  });
};

export default function CalendarStep({
  value,
  onChange,
  disabledDates,
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <p className="text-2xl font-semibold">Select dates</p>
        <p className="text-sm text-slate-500">
          Choose your check-in and check-out dates
        </p>
      </div>

      {/* Calendar */}
      <div className="border rounded-2xl p-4 w-fit bg-white">
        <Calendar
          mode="range"
          className="w-2xl"
          numberOfMonths={2}
          selected={value}
          disabled={[{ before: today }, ...disabledDates]}
          onSelect={(range) => {
            // Chưa chọn đủ from/to → cho qua
            if (!range?.from || !range?.to) {
              onChange(range);
              return;
            }

            // Validate range
            const blocked = isRangeBlocked(range.from, range.to, disabledDates);

            if (blocked) {
              toast.error("Selected dates include unavailable days");

              // Giữ from, reset to
              onChange({
                from: range.from,
                to: undefined,
              });
              return;
            }

            // Range hợp lệ
            onChange(range);
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Unavailable dates are disabled automatically
        </p>

        {(value?.from || value?.to) && (
          <Button
            variant="destructive"
            onClick={() => onChange(undefined)}
            className="text-sm"
          >
            Clear dates
          </Button>
        )}
      </div>
    </div>
  );
}
