"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, FileText } from "lucide-react";
import { AvailableExperienceSlot } from "./ExperienceSlotBooking";

interface ExperienceGuestQuantityAndNoteProps {
  guests: number;
  setGuests: (guests: number | ((prev: number) => number)) => void;
  selectedSlot: AvailableExperienceSlot | null;
  note: string;
  setNote: (note: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  canConfirm: boolean;
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
          Confirm Booking
        </Button>
      </div>
    </div>
  );
}
