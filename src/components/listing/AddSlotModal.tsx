"use client";

import { useState } from "react";
import { createExperienceSlots } from "@/src/services/experience/createExperienceSlots";
import toast from "react-hot-toast";

interface Props {
  experienceId: number;
  onClose: () => void;
  onAdd: (newSlots: any[]) => void; // bạn có thể type cụ thể hơn nếu muốn
}

export default function AddSlotModal({ experienceId, onClose, onAdd }: Props) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!startTime || !endTime || startTime >= endTime) {
      toast.error("Invalid slot time");
      return;
    }

    setLoading(true); // 🔹 bật loading
    try {
      const date = new Date().toISOString().slice(0, 10);
      const slots = await createExperienceSlots([
        {
          experience_id: experienceId,
          start_time: `${date}T${startTime}:00`,
          end_time: `${date}T${endTime}:00`,
          max_attendees: maxAttendees,
          is_active: true,
        },
      ]);

      onAdd(slots); // 🔹 cập nhật UI trước
      toast.success("Slot added");
      onClose(); // 🔹 đóng modal sau khi thêm xong
    } catch (err) {
      console.error(err);
      toast.error("Add slot failed");
    } finally {
      setLoading(false); // 🔹 reset loading luôn
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[400px] space-y-4 shadow-lg">
        <h2 className="font-semibold text-lg">Add Slot</h2>

        <div>
          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label>Max Attendees</label>
          <input
            type="number"
            value={maxAttendees}
            onChange={(e) => setMaxAttendees(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Adding..." : "Add Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
