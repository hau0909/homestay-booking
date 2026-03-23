/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { differenceInDays } from "date-fns";
import { isWeekend } from "@/src/utils/isWeekend";
import { formatPrice } from "@/src/utils/foormatPrice";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Voucher } from "@/src/types/voucher";

export default function PricingStep({
  dateRange,
  price_weekday,
  price_weekend,
  onTotalChange,
  selectedVoucher,
  setSelectedVoucher,
  vouchers,
}: {
  dateRange: any;
  price_weekday: number;
  price_weekend: number;
  onTotalChange: (total: number) => void;
  selectedVoucher: Voucher | null;
  setSelectedVoucher: (v: Voucher | null) => void;
  vouchers: Voucher[];
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

  const [voucherCode, setVoucherCode] = useState("");

  const weekdayTotal = weekdayCount * price_weekday;
  const weekendTotal = weekendCount * price_weekend;

  const subtotal = weekdayTotal + weekendTotal;
  const discount = selectedVoucher ? selectedVoucher.discount_value : 0;
  const total = Math.max(0, subtotal - discount);

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

      {/* Voucher Area */}
      <div className="space-y-3">
        <p className="font-semibold text-lg">Apply Voucher</p>
        <div className="flex flex-col gap-2">
          <Input 
            placeholder="Enter voucher code (e.g. SUMMER10)" 
            value={voucherCode} 
            onChange={(e) => {
              setVoucherCode(e.target.value);
              if (selectedVoucher && e.target.value.toUpperCase() !== selectedVoucher.code) {
                setSelectedVoucher(null);
              }
            }}
          />
          {!selectedVoucher && (
            <div className="space-y-2 mt-2">
              {vouchers.filter(v => v.code.toLowerCase().includes(voucherCode.toLowerCase())).length > 0 ? (
                vouchers.filter(v => v.code.toLowerCase().includes(voucherCode.toLowerCase())).map(v => (
                  <div 
                    key={v.id} 
                    className="border rounded-xl p-3 flex justify-between items-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => {
                      if (subtotal >= (v.min_price || 0)) {
                        setSelectedVoucher(v);
                        setVoucherCode(v.code);
                      }
                    }}
                  >
                    <div>
                      <p className="font-semibold">{v.code}</p>
                      <p className="text-xs text-slate-500">Discount: ${v.discount_value} USD</p>
                      {v.min_price && <p className="text-xs text-slate-500">Min spend: ${v.min_price} USD</p>}
                    </div>
                    {subtotal >= (v.min_price || 0) ? (
                      <span className="text-sm font-semibold text-teal-600">Apply</span>
                    ) : (
                      <span className="text-xs text-red-500 max-w-[80px] text-right">Min spend not met</span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No matching vouchers found.</p>
              )}
            </div>
          )}
          {selectedVoucher && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 flex justify-between items-center text-teal-800">
              <div>
                <p className="font-semibold text-sm">Voucher applied: {selectedVoucher.code}</p>
                <p className="text-xs">-${selectedVoucher.discount_value} USD</p>
              </div>
              <p 
                className="text-xs underline cursor-pointer hover:text-teal-900" 
                onClick={() => {
                  setSelectedVoucher(null);
                  setVoucherCode("");
                }}
              >
                Remove
              </p>
            </div>
          )}
        </div>
      </div>

      <hr />

      {/* Total */}
      <div className="space-y-2">
        {selectedVoucher && (
          <div className="flex justify-between items-center text-slate-500 line-through">
            <p className="text-sm">Subtotal</p>
            <p className="text-sm">${formatPrice(subtotal)} USD</p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <p className="font-semibold text-lg">Room total</p>
          <p className="font-semibold text-xl">${formatPrice(total)} USD</p>
        </div>
      </div>
    </div>
  );
}
