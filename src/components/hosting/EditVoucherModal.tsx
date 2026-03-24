"use client";

import { useEffect, useState, type FocusEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateVoucher } from "@/src/services/voucher/updateVoucher";
import type { Voucher } from "@/src/types/voucher";
import toast from "react-hot-toast";

function collapseSelectionToEnd(
  e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
) {
  const el = e.currentTarget;
  const len = el.value.length;
  requestAnimationFrame(() => {
    try {
      el.setSelectionRange(len, len);
    } catch {
      /* ignore */
    }
  });
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: Voucher;
  onUpdated?: () => void;
};

export default function EditVoucherModal({
  open,
  onOpenChange,
  voucher,
  onUpdated,
}: Props) {
  const [code, setCode] = useState(voucher.code);
  const [discountValue, setDiscountValue] = useState(String(voucher.discount_value));
  const [minPrice, setMinPrice] = useState(voucher.min_price != null ? String(voucher.min_price) : "");
  const [maxDiscount, setMaxDiscount] = useState(voucher.max_discount != null ? String(voucher.max_discount) : "");
  const [usageLimit, setUsageLimit] = useState(voucher.usage_limit != null ? String(voucher.usage_limit) : "");
  const [timesUsed, setTimesUsed] = useState(String(voucher.used_count ?? 0));
  const [isActive, setIsActive] = useState(voucher.is_active ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode(voucher.code);
    setDiscountValue(String(voucher.discount_value));
    setMinPrice(voucher.min_price != null ? String(voucher.min_price) : "");
    setMaxDiscount(voucher.max_discount != null ? String(voucher.max_discount) : "");
    setUsageLimit(voucher.usage_limit != null ? String(voucher.usage_limit) : "");
    setTimesUsed(String(voucher.used_count ?? 0));
    setIsActive(voucher.is_active ?? true);
  }, [open, voucher]);

  const parseOptionalInt = (s: string): number | null => {
    const t = s.trim();
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : NaN;
  };

  const handleUpdate = async () => {
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
      await updateVoucher(voucher.id, {
        code: c,
        discount_value: disc,
        min_price: minP,
        max_discount: maxD,
        usage_limit: limit,
        used_count: used ?? 0,
        is_active: isActive,
      });
      toast.success("Voucher updated.");
      onOpenChange(false);
      onUpdated?.();
    } catch (e: unknown) {
      const err = e as { message?: string };
      toast.error(err.message || "Failed to update voucher.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Edit Voucher
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
              onFocus={collapseSelectionToEnd}
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
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? "Updating…" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
