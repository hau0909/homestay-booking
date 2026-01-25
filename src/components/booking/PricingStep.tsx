/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { differenceInDays } from "date-fns";
import { isWeekend } from "@/src/utils/isWeekend";
import { formatPrice } from "@/src/utils/foormatPrice";
import { useEffect } from "react";

export default function PricingStep({
  dateRange,
  price_weekday,
  price_weekend,
  onTotalChange,
}: {
  dateRange: any;
  price_weekday: number;
  price_weekend: number;
  onTotalChange: (total: number) => void;
}) {
  if (!dateRange?.from || !dateRange?.to) {
    return (
      <p className="text-sm text-slate-500">
        Select your check-in and check-out dates to calculate the room price
      </p>
    );
  }

  const nights = differenceInDays(dateRange.to, dateRange.from);

  let weekdayCount = 0;
  let weekendCount = 0;

  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(dateRange.from);
    currentDate.setDate(currentDate.getDate() + i);

    if (isWeekend(currentDate)) {
      weekendCount++;
    } else {
      weekdayCount++;
    }
  }

  const weekdayTotal = weekdayCount * price_weekday;
  const weekendTotal = weekendCount * price_weekend;

  const total = weekdayTotal + weekendTotal;

  useEffect(() => {
    onTotalChange?.(total);
  }, [total]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <p className="text-2xl font-semibold">Room pricing</p>
        <p className="text-sm text-slate-500">
          Price breakdown based on selected dates
        </p>
      </div>

      {/* Breakdown */}
      <div className="space-y-3 text-sm">
        {weekdayCount > 0 && (
          <div className="flex justify-between">
            <p>
              Weekday · {weekdayCount} night
              {weekdayCount > 1 ? "s" : ""} × ${formatPrice(price_weekday)}
            </p>
            <p>${formatPrice(weekdayTotal)} USD</p>
          </div>
        )}

        {weekendCount > 0 && (
          <div className="flex justify-between">
            <p>
              Weekend · {weekendCount} night
              {weekendCount > 1 ? "s" : ""} × ${formatPrice(price_weekend)}
            </p>
            <p>${formatPrice(weekendTotal)} USD</p>
          </div>
        )}

        <p className="text-xs text-slate-500">
          * Room charges only. Taxes and additional fees are not included.
        </p>
      </div>

      <hr />

      {/* Total */}
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg">Room total</p>
        <p className="font-semibold text-xl">${formatPrice(total)} USD</p>
      </div>
    </div>
  );
}
