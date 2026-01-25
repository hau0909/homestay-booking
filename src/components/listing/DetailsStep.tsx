"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import type { CreateListingForm } from "@/app/hosting/listing/create/page";

/* =======================
   PROPS
======================= */
type Props = {
  data: CreateListingForm;
  onChange: (data: CreateListingForm) => void;
  onNext: () => void;
  onBack: () => void;
};

type CounterRowProps = {
  label: string;
  value: number;
  min?: number;
  unit?: string;
  onChange: (v: number) => void;
};

/* =======================
   COUNTER ROW
======================= */
function CounterRow({
  label,
  value,
  onChange,
  min = 0,
  unit,
}: CounterRowProps) {
  return (
    <div className="flex items-center justify-between py-6 border-b last:border-b-0">
      {/* Left */}
      <div className="space-y-1">
        <p className="text-base font-medium text-slate-900">{label}</p>
        {unit && (
          <p className="text-sm text-muted-foreground">{unit}</p>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="h-9 w-9 rounded-full"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            const onlyNumber = e.target.value.replace(/\D/g, "");
            onChange(onlyNumber === "" ? min : Number(onlyNumber));
          }}
          onBlur={() => {
            if (value < min) onChange(min);
          }}
          className="
            w-16 rounded-lg border text-center
            py-1.5 text-sm font-semibold
            focus:outline-none focus:ring-2 focus:ring-slate-400
          "
        />

        <Button
          variant="outline"
          size="icon"
          onClick={() => onChange(value + 1)}
          className="h-9 w-9 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* =======================
   DETAILS STEP
======================= */
export default function DetailsStep({
  data,
  onChange,
  onNext,
  onBack,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Property details</h2>
          <p className="text-sm text-muted-foreground">
            Share some basics about your place
          </p>
        </div>

        {/* Counters */}
        <div className="divide-y">
          <CounterRow
            label="Guest capacity"
            value={data.max_guests}
            min={1}
            unit="Maximum number of guests"
            onChange={(v) =>
              onChange({ ...data, max_guests: v })
            }
          />

          <CounterRow
            label="Beds"
            value={data.bed_count}
            min={0}
            unit="Total beds available"
            onChange={(v) =>
              onChange({ ...data, bed_count: v })
            }
          />

          <CounterRow
            label="Bathrooms"
            value={data.bath_count}
            min={0}
            unit="Number of bathrooms"
            onChange={(v) =>
              onChange({ ...data, bath_count: v })
            }
          />

          <CounterRow
            label="Room size"
            value={data.room_size}
            min={5}
            unit="Square meters"
            onChange={(v) =>
              onChange({ ...data, room_size: v })
            }
          />

          <CounterRow
            label="Quantity"
            value={data.quantity}
            min={1}
            unit="How many units of this listing"
            onChange={(v) =>
              onChange({ ...data, quantity: v })
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Next</Button>
        </div>
      </div>
    </div>
  );
}
