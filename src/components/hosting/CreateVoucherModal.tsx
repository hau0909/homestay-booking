"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createVoucher } from "@/src/services/voucher/createVoucher";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
  onCreated?: () => void;
};

export default function CreateVoucherModal({
  open,
  onOpenChange,
  listingId,
  onCreated,
}: Props) {
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [timesUsed, setTimesUsed] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode("");
    setDiscountValue("");
    setMinPrice("");
    setMaxDiscount("");
    setUsageLimit("");
    setTimesUsed("0");
    setIsActive(true);
  }, [open]);

  const parseOptionalInt = (s: string): number | null => {
    const t = s.trim();
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : NaN;
  };

  const handleCreate = async () => {
    const c = code.trim();
    if (!c) {
      toast.error("Please enter a voucher code.");
      return;
    }
    const disc = Number(discountValue);
    if (discountValue.trim() === "" || Number.isNaN(disc) || disc < 0) {
      toast.error("Please enter a valid discount value.");
      return;
    }

    const minP = parseOptionalInt(minPrice);
    const maxD = parseOptionalInt(maxDiscount);
    const limit = parseOptionalInt(usageLimit);
    if (Number.isNaN(minP) || Number.isNaN(maxD) || Number.isNaN(limit)) {
      toast.error("Optional fields must be empty or valid non‑negative numbers.");
      return;
    }

    const used = parseOptionalInt(timesUsed);
    if (Number.isNaN(used)) {
      toast.error("Times Used must be a valid non‑negative whole number.");
      return;
    }

    setSaving(true);
    try {
      await createVoucher({
        listing_id: listingId,
        code: c,
        discount_value: disc,
        min_price: minP,
        max_discount: maxD,
        usage_limit: limit,
        used_count: used ?? 0,
        is_active: isActive,
      });
      toast.success("Voucher created.");
      onOpenChange(false);
      onCreated?.();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || "Failed to create voucher.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Create Voucher
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 border-t border-b border-slate-200 py-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Voucher Code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SUMMER10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Discount Value
            </label>
            <Input
              type="number"
              min={0}
              step="any"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="Amount or percent per your DB convention"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Minimum Booking Price{" "}
              <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <Input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Leave empty if none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Maximum Discount{" "}
              <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <Input
              type="number"
              min={0}
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder="Leave empty if none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Usage Limit{" "}
              <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Times Used
            </label>
            <Input
              type="number"
              min={0}
              step={1}
              value={timesUsed}
              onChange={(e) => setTimesUsed(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="text-sm font-medium text-slate-800">
              Active Status
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((v) => !v)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                isActive ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleCreate}
            disabled={saving}
          >
            {saving ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
