"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import { format } from "date-fns";

interface ExperienceBookingStep1Props {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedSlot: ExperienceSlot | null;
  setSelectedSlot: (slot: ExperienceSlot | null) => void;
  availableSlots: ExperienceSlot[];
  onNext: () => void;
  canProceed: boolean;
}

export default function ExperienceBookingStep1({
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  availableSlots,
  onNext,
  canProceed,
}: ExperienceBookingStep1Props) {
  // Helper to format time nicely (e.g. 14:00:00 -> 2:00 PM)
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const d = new Date();
      d.setHours(parseInt(hours, 10));
      d.setMinutes(parseInt(minutes, 10));
      return format(d, "h:mm a");
    } catch {
      return timeString;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Step 1 Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex justify-center items-center text-slate-800 font-bold">
            1
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-800">
              When do you want to go?
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Choose a date and an available starting time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-0 md:ml-12 pt-2">
          {/* Calendar Block */}
          <div className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
              <CalendarIcon size={18} /> Select Date
            </label>
            <div className="border border-slate-200 rounded-2xl overflow-hidden p-4 bg-white shadow-sm inline-block w-full text-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => {
                  setSelectedDate(day);
                  setSelectedSlot(null); // Reset slot when date changes
                }}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                className=""
              />
            </div>
          </div>

          {/* Time Slot Block */}
          <div className="space-y-4 flex flex-col">
            <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
              <Clock size={18} /> Select Time Slot
            </label>
            {selectedDate ? (
              <div className="flex-1 border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-3 max-h-[350px] overflow-y-auto">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center justify-between p-4 rounded-xl border w-full text-left transition-all ${
                        selectedSlot?.id === slot.id
                          ? "border-slate-800 bg-slate-50 ring-1 ring-slate-800"
                          : "border-slate-200 hover:border-slate-400 bg-white"
                      }`}
                    >
                      <div>
                        <p
                          className={`font-semibold ${selectedSlot?.id === slot.id ? "text-slate-800" : "text-slate-700"}`}
                        >
                          {formatTime(slot.start_time)} -{" "}
                          {formatTime(slot.end_time)}
                        </p>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-md ${selectedSlot?.id === slot.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
                      >
                        Up to {slot.max_attendees}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-slate-500">
                      No slots available on this date.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 w-full border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center min-h-[350px]">
                <CalendarIcon className="w-10 h-10 text-slate-300 mb-4" />
                <p className="text-sm text-slate-500">
                  Pick a date first to see available slots
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Area Step 1 */}
      <div className="ml-0 md:ml-12 pt-6 border-t border-slate-100 flex justify-end">
        <Button
          size="lg"
          className="w-full md:w-auto px-10 text-lg h-14"
          disabled={!canProceed}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
