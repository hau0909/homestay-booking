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
import { updateCancelPolicy } from "@/src/services/cancel-policy/updateCancelPolicy";
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

export interface EditCancellationPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
  imageUrl?: string;
  policies: CancelPolicy[];
  onSaved?: () => void;
}

function policyToForm(p: CancelPolicy) {
  const r = p.refund_percentage ?? 0;
  return {
    policyName: p.name?.trim() ?? "",
    description: p.description ?? "",
    refundPct: String(r),
    cancelBeforeHours:
      p.cancel_before_hours != null ? String(p.cancel_before_hours) : "",
  };
}

function refundSelectIncludes(value: string): boolean {
  const n = Number(value);
  return REFUND_OPTIONS.includes(n as (typeof REFUND_OPTIONS)[number]);
}

export default function EditCancellationPolicyModal({
  open,
  onOpenChange,
  listing,
  imageUrl,
  policies,
  onSaved,
}: EditCancellationPolicyModalProps) {
  const [policyId, setPolicyId] = useState<string>("");
  const [policyName, setPolicyName] = useState("");
  const [description, setDescription] = useState("");
  const [refundPct, setRefundPct] = useState<string>("50");
  const [cancelBeforeHours, setCancelBeforeHours] = useState("");
  const [saving, setSaving] = useState(false);

  const sortedPolicies = useMemo(
    () => [...policies].sort((a, b) => a.id - b.id),
    [policies]
  );

  const selectedPolicy = useMemo(
    () => sortedPolicies.find((p) => String(p.id) === policyId),
    [sortedPolicies, policyId]
  );

  useEffect(() => {
    if (!open || !listing) return;
    const first = sortedPolicies[0];
    if (!first) {
      setPolicyId("");
      setPolicyName("");
      setDescription("");
      setRefundPct("50");
      setCancelBeforeHours("");
      return;
    }
    const idStr = String(first.id);
    setPolicyId(idStr);
    const f = policyToForm(first);
    setPolicyName(f.policyName);
    setDescription(f.description);
    setRefundPct(f.refundPct);
    setCancelBeforeHours(f.cancelBeforeHours);
  }, [open, listing?.id, sortedPolicies]);

  const handlePolicyChange = (value: string) => {
    setPolicyId(value);
    const p = sortedPolicies.find((x) => String(x.id) === value);
    if (!p) return;
    const f = policyToForm(p);
    setPolicyName(f.policyName);
    setDescription(f.description);
    setRefundPct(f.refundPct);
    setCancelBeforeHours(f.cancelBeforeHours);
  };

  const handleSave = async () => {
    const id = Number(policyId);
    if (!id || !selectedPolicy) {
      toast.error("No policy selected.");
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
      await updateCancelPolicy(id, {
        name,
        description: description.trim() || null,
        refund_percentage: refund,
        cancel_before_hours: hours,
      });
      toast.success("Policy updated.");
      onOpenChange(false);
      onSaved?.();
    } catch (e: unknown) {
      const err = e as { message?: string; details?: string; hint?: string };
      console.error("updateCancelPolicy error:", e);
      const msg = err.details || err.hint || err.message || "Unknown error";
      toast.error(`Lỗi khi lưu: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const noPolicies = sortedPolicies.length === 0;
  const showPolicySwitch = sortedPolicies.length > 1;

  if (!listing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Không tìm thấy listing</DialogTitle>
            <DialogDescription>
              Listing không tồn tại hoặc bạn không có quyền chỉnh sửa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-xl"
        showCloseButton
      >
        <DialogHeader className="space-y-1 pr-8 text-left">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Edit Cancellation Policy
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Define refund and penalty rules for your listings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {noPolicies ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No policy found for this listing.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-start sm:gap-4">
                <div className="shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
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
                  <p className="font-semibold text-slate-900">{listing.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {listing.address_detail?.trim() || "—"}
                  </p>
                </div>
              </div>

              {showPolicySwitch ? (
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-slate-800">
                    Policy
                  </span>
                  <Select value={policyId} onValueChange={handlePolicyChange}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedPolicies.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name?.trim() || `Policy #${p.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="space-y-2">
                <label
                  htmlFor="edit-policy-name"
                  className="text-sm font-semibold text-slate-800"
                >
                  Policy Name
                </label>
                <Input
                  id="edit-policy-name"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  onFocus={collapseSelectionToEnd}
                  placeholder="e.g. Flexible — 7 days"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-policy-desc"
                  className="text-sm font-semibold text-slate-800"
                >
                  Description
                </label>
                <Textarea
                  id="edit-policy-desc"
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
                      {refundPct && !refundSelectIncludes(refundPct) ? (
                        <SelectItem value={refundPct}>{refundPct}%</SelectItem>
                      ) : null}
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
                    htmlFor="edit-cancel-hours"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Cancel Before Hours
                  </label>
                  <span className="text-sm text-slate-500">(in hours)</span>
                </div>
                <Input
                  id="edit-cancel-hours"
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
            disabled={saving || noPolicies}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
