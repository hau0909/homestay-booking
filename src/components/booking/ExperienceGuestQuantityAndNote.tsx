"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, FileText, Tag, ShieldAlert } from "lucide-react";
import { AvailableExperienceSlot } from "./ExperienceSlotBooking";
import { Voucher } from "@/src/types/voucher";
import { CancelPolicy } from "@/src/types/cancel-policy";

interface ExperienceGuestQuantityAndNoteProps {
  guests: number;
  setGuests: (guests: number | ((prev: number) => number)) => void;
  selectedSlot: AvailableExperienceSlot | null;
  note: string;
  setNote: (note: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  selectedVoucher: Voucher | null;
  setSelectedVoucher: (v: Voucher | null) => void;
  subtotal: number;
  paymentMethod: "CASH" | "BANK";
  setPaymentMethod: (m: "CASH" | "BANK") => void;
  cancelPolicy: CancelPolicy | null;
  vouchers: Voucher[];
}

export default function ExperienceGuestQuantityAndNote({
  guests,
  setGuests,
  selectedSlot,
  note,
  setNote,
  onBack,
  onConfirm,
  canConfirm,
  voucherCode,
  setVoucherCode,
  selectedVoucher,
  setSelectedVoucher,
  subtotal,
  paymentMethod,
  setPaymentMethod,
  cancelPolicy,
  vouchers,
}: ExperienceGuestQuantityAndNoteProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Step 3: Number of Guests */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex justify-center items-center text-slate-800 font-bold">
            3
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-800">
              Who's coming?
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Tell us how many people will join this experience.
            </p>
          </div>
        </div>

        <div className="ml-0 md:ml-12 border border-slate-200 rounded-xl p-5 w-full md:w-2/3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 flex items-center gap-2">
              <Users size={16} /> Guests
            </p>
            {selectedSlot ? (
              <p className="text-xs text-slate-500 mt-0.5">
                Max {selectedSlot.available_guests} people available for this
                slot
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">
                Please go back and select a slot
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGuests((prev) => Math.max(1, prev - 1))}
              disabled={guests <= 1 || !selectedSlot}
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              −
            </button>
            <span className="w-4 text-center font-semibold text-lg text-slate-800">
              {guests}
            </span>
            <button
              onClick={() =>
                setGuests((prev) =>
                  Math.min(selectedSlot?.available_guests || 99, prev + 1),
                )
              }
              disabled={
                !selectedSlot || guests >= selectedSlot.available_guests
              }
              className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <hr className="border-slate-200 ml-0 md:ml-12" />

      {/* Voucher Input Step */}
      <div className="space-y-6">
        <div className="ml-0 md:ml-12 border border-slate-200 rounded-xl p-5 w-full md:w-2/3">
          <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 mb-3">
            <Tag size={16} /> Apply Voucher
          </label>
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
      </div>

      <hr className="border-slate-200 ml-0 md:ml-12" />

      {/* Step 4 (Now Part of Step 3): Note */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex justify-center items-center text-slate-800 font-bold">
            4
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-800">
              Add a note to the host
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Let the host know if you have any special requests or dietary
              restrictions.
            </p>
          </div>
        </div>

        <div className="ml-0 md:ml-12">
          <label className="text-sm font-semibold flex items-center gap-2 text-slate-700 mb-3">
            <FileText size={16} /> Message
          </label>
          <Textarea
            placeholder="Hello, I would like to book this experience..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-32 resize-none text-base p-4"
          />
        </div>
      </div>

      <hr className="border-slate-200 ml-0 md:ml-12" />

      {/* Payment Method */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex justify-center items-center text-slate-800 font-bold">
            5
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              Payment Method
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Choose how you'd like to pay for your experience.
            </p>
          </div>
        </div>

        <div className="ml-0 md:ml-12 flex flex-col gap-3 w-full md:w-2/3">
          <label className={`border p-4 rounded-xl cursor-pointer flex gap-3 items-center transition-all ${paymentMethod === 'CASH' ? 'border-black ring-1 ring-black bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="w-5 h-5 accent-black" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">Pay at property</span>
              <span className="text-sm text-slate-500">Pay the host in cash when you arrive</span>
            </div>
          </label>
          <label className={`border p-4 rounded-xl cursor-pointer flex gap-3 items-center transition-all ${paymentMethod === 'BANK' ? 'border-black ring-1 ring-black bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <input type="radio" name="paymentMethod" value="BANK" checked={paymentMethod === 'BANK'} onChange={() => setPaymentMethod('BANK')} className="w-5 h-5 accent-black" />
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">Bank Transfer</span>
              <span className="text-sm text-slate-500">Pay securely via bank transfer to secure your booking</span>
            </div>
          </label>
        </div>
      </div>

      <hr className="border-slate-200 ml-0 md:ml-12" />

      {/* Cancellation Policy Step */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex justify-center items-center text-slate-800 font-bold">
            <ShieldAlert size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              Cancellation Policy
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Please review the policy before checking out.
            </p>
          </div>
        </div>

        {cancelPolicy ? (
          <div className="ml-0 md:ml-12 bg-amber-50 border border-amber-100 rounded-xl p-5 w-full md:w-2/3">
            <p className="font-semibold text-amber-800 mb-1">{cancelPolicy.name}</p>
            <p className="text-sm text-amber-900">{cancelPolicy.description}</p>
            {cancelPolicy.cancel_before_hours != null && cancelPolicy.refund_percentage != null && (
              <p className="text-sm mt-3 font-medium text-amber-800">
                Cancel before {cancelPolicy.cancel_before_hours} hours to get {cancelPolicy.refund_percentage}% refund.
              </p>
            )}
          </div>
        ) : (
          <div className="ml-0 md:ml-12 bg-amber-50 border border-amber-100 rounded-xl p-5 w-full md:w-2/3">
            <p className="text-sm text-amber-900 italic">No cancellation policy available.</p>
          </div>
        )}
      </div>

      {/* Action Area Step 3 */}
      <div className="ml-0 md:ml-12 pt-6 border-t border-slate-100 flex justify-between items-center">
        <Button
          variant="ghost"
          size="lg"
          className="px-6 text-lg hover:bg-slate-100"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2" size={20} /> Back
        </Button>
        <Button
          size="lg"
          className="px-10 text-lg h-14"
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          {paymentMethod === "BANK" ? "Confirm & Pay" : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
}
