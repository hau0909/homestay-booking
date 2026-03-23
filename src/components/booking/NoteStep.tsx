import { Textarea } from "@/components/ui/textarea";
import { CancelPolicy } from "@/src/types/cancel-policy";
import { ShieldAlert } from "lucide-react";

export default function NoteStep({
  note,
  setNote,
  paymentMethod,
  setPaymentMethod,
  cancelPolicy,
}: {
  note: string;
  setNote: (v: string) => void;
  paymentMethod: "CASH" | "BANK";
  setPaymentMethod: (m: "CASH" | "BANK") => void;
  cancelPolicy: CancelPolicy | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl font-semibold">Note for host</p>
        <p className="text-sm text-slate-500">
          Optional — share any special requests or details with the host
        </p>
      </div>

      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. We’ll arrive around 9PM, please let us know if that works."
        className="min-h-30 rounded-xl focus-visible:ring-2 focus-visible:ring-black"
      />

      <p className="text-xs text-slate-500">
        This note will be sent to the host after you confirm the booking.
      </p>

      <hr className="my-6 border-slate-200" />

      {/* Payment Method */}
      <div className="space-y-4">
        <div>
          <p className="text-xl font-semibold flex items-center gap-2">
            Payment Method
          </p>
          <p className="text-sm text-slate-500">
            Choose how you'd like to pay for your stay.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label
            className={`border p-4 rounded-xl cursor-pointer flex gap-3 items-center transition-all ${paymentMethod === "CASH" ? "border-black ring-1 ring-black bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="CASH"
              checked={paymentMethod === "CASH"}
              onChange={() => setPaymentMethod("CASH")}
              className="w-5 h-5 accent-black"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                Pay at property
              </span>
              <span className="text-sm text-slate-500">
                Pay the host in cash when you arrive
              </span>
            </div>
          </label>
          <label
            className={`border p-4 rounded-xl cursor-pointer flex gap-3 items-center transition-all ${paymentMethod === "BANK" ? "border-black ring-1 ring-black bg-slate-50" : "border-slate-200 hover:border-slate-300"}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="BANK"
              checked={paymentMethod === "BANK"}
              onChange={() => setPaymentMethod("BANK")}
              className="w-5 h-5 accent-black"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">
                Bank Transfer
              </span>
              <span className="text-sm text-slate-500">
                Pay securely via bank transfer to secure your booking
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="space-y-4">
        <div>
          <p className="text-xl font-semibold flex items-center gap-2">
            <ShieldAlert size={20} className="text-amber-600" /> Cancellation
            Policy
          </p>
          <p className="text-sm text-slate-500">
            Please review the host's cancellation policy before confirming.
          </p>
        </div>

        {cancelPolicy ? (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col gap-2">
            <p className="font-semibold text-amber-800">
              {cancelPolicy.name}
            </p>
            <p className="text-sm text-amber-900">
              {cancelPolicy.description}
            </p>
            {cancelPolicy.refund_percentage !== null && (
              <p className="text-sm font-medium text-amber-800">
                Refund applied: {cancelPolicy.refund_percentage}%
              </p>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex flex-col gap-2">
            <p className="text-sm text-amber-900 italic">No cancellation policy available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
