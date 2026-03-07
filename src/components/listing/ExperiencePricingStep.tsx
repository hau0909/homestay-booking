"use client";

import { Input } from "@/components/ui/input";
import { formatPrice } from "@/src/utils/foormatPrice";

type Props = {
  value: number;
  onChange: (data: number) => void;
};

export default function ExperiencePricingStep({ value, onChange }: Props) {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Now, set your price
        </h2>
        <p className="text-muted-foreground text-sm">
          You can change it anytime. Setting a fair price per person helps
          attract more guests.
        </p>
      </div>

      <div className="w-full max-w-150 mx-auto">
        <div className="px-8 py-10 border border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center min-h-75 transition-all hover:border-slate-400 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 shadow-sm">
          <label className="text-xl font-bold text-slate-700 mb-10">
            Price per person
          </label>

          <div className="relative flex items-center justify-center mb-12 w-48">
            <span className="absolute left-4 text-2xl font-bold text-slate-500 shrink-0 select-none pointer-events-none">
              $
            </span>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={value || ""}
              onChange={(e) => onChange(Number(e.target.value))}
              className="h-14 w-full text-xl font-semibold text-center bg-transparent border-none focus-visible:ring-0 shadow-none pl-8 pr-2 text-slate-800 tabular-nums placeholder:text-slate-300 placeholder:font-normal"
            />
          </div>

          <div
            className={`text-lg text-slate-500 transition-opacity duration-300 w-full text-center border-t border-slate-300 pt-8 ${value > 0 ? "opacity-100" : "opacity-0"}`}
          >
            Customer will pay{" "}
            <span className="font-bold text-slate-800">
              ${formatPrice(value) || "0"} / person
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
