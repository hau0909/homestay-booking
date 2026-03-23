"use client";

import { useEffect, useMemo, useState, type FocusEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCancelPolicy } from "@/src/services/cancel-policy/createCancelPolicy";
import type { Listing } from "@/src/types/listing";
import type { CancelPolicy } from "@/src/types/cancel-policy";
import toast from "react-hot-toast";

const REFUND_OPTIONS = [0, 25, 50, 75, 100] as const;

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

export interface AddCancellationPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listings: Listing[];
  images: Record<number, string>;
  policies: Record<number, CancelPolicy[]>;
  listingType: "HOME" | "EXPERIENCE";
  onSaved?: () => void;
}

export default function AddCancellationPolicyModal({
  open,
  onOpenChange,
  listings,
  images,
  policies,
  listingType,
  onSaved,
}: AddCancellationPolicyModalProps) {
  const eligibleListings = useMemo(
    () => listings.filter(
      (l) => l.listing_type === listingType && (!policies[l.id] || policies[l.id].length === 0)
    ),
    [listings, policies, listingType]
  );

  const [listingId, setListingId] = useState<string>("");
  const [policyName, setPolicyName] = useState("");
  const [description, setDescription] = useState("");
  const [refundPct, setRefundPct] = useState<string>("50");
  const [cancelBeforeHours, setCancelBeforeHours] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const first = eligibleListings[0];
    setListingId(first ? String(first.id) : "");
    setPolicyName("");
    setDescription("");
    setRefundPct("50");
    setCancelBeforeHours("");
  }, [open, eligibleListings]);

  const selectedListing = useMemo(
    () => eligibleListings.find((l) => String(l.id) === listingId),
    [eligibleListings, listingId]
  );

  const handleSave = async () => {
    const id = Number(listingId);
    if (!id || !selectedListing) {
      toast.error("Please select a listing.");
      return;
    }
    const name = policyName.trim();
    if (!name) {
      toast.error("Please enter a policy name.");
      return;
    }
    const hours = Number(cancelBeforeHours);
    if (
      cancelBeforeHours.trim() === "" ||
      Number.isNaN(hours) ||
      hours < 0
    ) {
      toast.error("Please enter a valid number for cancel before hours.");
      return;
    }
    const refund = Number(refundPct);
    if (Number.isNaN(refund)) {
      toast.error("Please select a refund percentage.");
      return;
    }

    setSaving(true);
    try {
      await createCancelPolicy({
        listing_id: id,
        name,
        description: description.trim() || null,
        refund_percentage: refund,
        cancel_before_hours: hours,
      });
      toast.success("Cancellation policy saved.");
      onOpenChange(false);
      onSaved?.();
    } catch (e: unknown) {
      const err = e as { message?: string; details?: string; hint?: string };
      console.error("createCancelPolicy error:", e);
      const msg =
        err.details || err.hint || err.message || "Unknown error";
      toast.error(`Lỗi khi lưu: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const noListings = eligibleListings.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-xl"
        showCloseButton
      >
        <DialogHeader className="space-y-1 pr-8 text-left">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Add Cancellation Policy
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Define refund and penalty rules for your listings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {noListings ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No home listings available. Create a listing first.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-start sm:gap-4">
                <div className="shrink-0">
                  {selectedListing && images[selectedListing.id] ? (
                    <img
                      src={images[selectedListing.id]}
                      alt=""
                      className="h-16 w-24 rounded-lg object-cover sm:h-[72px] sm:w-[108px]"
                    />
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500 sm:h-[72px] sm:w-[108px]">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {selectedListing?.title ?? "—"}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {selectedListing?.address_detail?.trim() || "—"}
                  </p>
                </div>
                <div className="shrink-0 sm:ml-auto sm:w-[min(100%,220px)]">
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 sm:text-right">
                    Listing
                  </label>
                  <Select
                    value={listingId}
                    onValueChange={setListingId}
                    disabled={eligibleListings.length === 0}
                  >
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue placeholder="Select listing" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {eligibleListings.map((l: Listing) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="policy-name"
                  className="text-sm font-semibold text-slate-800"
                >
                  Policy Name
                </label>
                <Input
                  id="policy-name"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  onFocus={collapseSelectionToEnd}
                  placeholder="e.g. Flexible — 7 days"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="policy-desc"
                  className="text-sm font-semibold text-slate-800"
                >
                  Description
                </label>
                <Textarea
                  id="policy-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when guests receive a refund or partial penalty."
                  className="min-h-[100px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-800">
                  Refund Percentage
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={refundPct} onValueChange={setRefundPct}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REFUND_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline gap-2">
                  <label
                    htmlFor="cancel-hours"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Cancel Before Hours
                  </label>
                  <span className="text-sm text-slate-500">(in hours)</span>
                </div>
                <Input
                  id="cancel-hours"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={cancelBeforeHours}
                  onChange={(e) => setCancelBeforeHours(e.target.value)}
                  placeholder="e.g. 168"
                  className="max-w-[200px]"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
            className="bg-[#328E6E] text-white hover:bg-[#256d52]"
            onClick={handleSave}
            disabled={saving || noListings}
          >
            {saving ? "Saving…" : "Save Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
