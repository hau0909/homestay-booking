"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function PricingStep({
  data,
  onChange,
  onNext,
  onBack,
}: Props) {
  const canNext =
    data.price_weekday > 0 &&
    data.price_weekend > 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Card */}
      <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">
            Set your pricing
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose competitive prices to attract guests
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-5">
          <PriceInput
            label="Base price"
            description="Price per night from Monday to Friday"
            value={data.price_weekday}
            onChange={(v) =>
              onChange({ ...data, price_weekday: v })
            }
          />

          <PriceInput
            label="Weekend price"
            description="Price per night on Saturday and Sunday"
            value={data.price_weekend}
            onChange={(v) =>
              onChange({ ...data, price_weekend: v })
            }
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={!canNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/* =======================
   PRICE INPUT
======================= */
function PriceInput({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      {/* Label */}
      <div>
        <p className="text-sm font-medium text-slate-900">
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <Input
          type="text"
          inputMode="numeric"
          placeholder="e.g. 200"
          value={value === 0 ? "" : value}
          onChange={(e) => {
            const onlyNumber = e.target.value.replace(/\D/g, "");
            onChange(onlyNumber === "" ? 0 : Number(onlyNumber));
          }}
          className="
            pr-20 text-base font-medium
            focus:ring-2 focus:ring-slate-400
          "
        />

        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
          USD / night
        </span>
      </div>
    </div>
  );
}
