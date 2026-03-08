"use client";

import { useState } from "react";
import { Plus, Clock, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExperienceSlot } from "@/src/types/experienceSlot";
import toast from "react-hot-toast";
import { format } from "date-fns";

type Props = {
  value: ExperienceSlot[];
  onChange: (data: ExperienceSlot[]) => void;
};

export default function ExperienceSlotStep({ value, onChange }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for new slot
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState<string>("");
  const activityId = () => Date.now();

  const handleAddSlot = () => {
    if (!startTime || !endTime || !maxAttendees) return;
    if (startTime >= endTime) {
      toast.error("Start time must be before end time");
      return;
    }
    const newSlot: ExperienceSlot = {
      id: activityId(), // Temporary ID for UI
      experience_id: 0,
      start_time: startTime,
      end_time: endTime,
      max_attendees: Number(maxAttendees),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Sort slots by start_time
    const updatedSlots = [...value, newSlot].sort((a, b) =>
      a.start_time.localeCompare(b.start_time),
    );

    onChange(updatedSlots);
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setStartTime("");
    setEndTime("");
    setMaxAttendees("");
  };

  const handleDeleteSlot = (id: number) => {
    onChange(value.filter((s: ExperienceSlot) => s.id !== id));
  };

  // Helper to format time nicely (e.g., 09:00 -> 9:00 AM)
  const formatTime = (timeString: string) => {
    try {
      if (timeString.includes("T") || timeString.includes("-")) {
        const date = new Date(timeString);
        return format(date, "h:mm a");
      }

      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Set up your availability
        </h2>
        <p className="text-muted-foreground text-sm">
          Add the time slots when your experience is typically available. You
          can add multiple slots per day.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Slots list */}
        <div className="lg:col-span-2 space-y-4">
          {value.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <p className="text-slate-500 text-sm">
                No slots added yet. Click the button to add your availability.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {value.map((slot) => (
                <div
                  key={slot.id}
                  className="relative p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-4/5 flex items-center gap-6 text-slate-800 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <div>
                        <p>{formatTime(slot.start_time)}</p>
                        <p>{formatTime(slot.end_time)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors  focus:opacity-100"
                      title="Delete slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 pl-1">
                    <Users className="w-4 h-4" />
                    <span>
                      Up to{" "}
                      <strong className="text-slate-700">
                        {slot.max_attendees}
                      </strong>{" "}
                      people per slot
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Add Slot Button area */}
        <div className="lg:col-span-1">
          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <button className="w-full aspect-square md:aspect-auto md:h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-slate-700 bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Add Time Slot</span>
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Add Time Slot</DialogTitle>
                <DialogDescription>
                  Define a precise start and end time, and the maximum number of
                  guests.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="start_time"
                      className="text-sm font-medium text-slate-700"
                    >
                      Start Time
                    </label>
                    <Input
                      id="start_time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="end_time"
                      className="text-sm font-medium text-slate-700"
                    >
                      End Time
                    </label>
                    <Input
                      id="end_time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="max_attendees"
                    className="text-sm font-medium text-slate-700"
                  >
                    Maximum Attendees
                  </label>
                  <Input
                    id="max_attendees"
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={maxAttendees}
                    onChange={(e) => setMaxAttendees(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    The maximum number of people who can book this specific time
                    slot.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSlot}
                  disabled={!startTime || !endTime || !maxAttendees}
                >
                  Add Slot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
