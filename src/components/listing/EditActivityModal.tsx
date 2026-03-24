"use client";

import { useState, useCallback, useEffect } from "react";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import toast from "react-hot-toast";
import { updateExperienceActivities } from "@/src/services/experience/updateExperienceActivities";

interface Props {
  experienceId: number;
  activity: ExperienceActivity;
  onClose: () => void;
  onUpdate: (updatedActivity: ExperienceActivity) => void;
  loadImages: () => Promise<void>;
}

export default function EditActivityModal({
  experienceId,
  activity,
  onClose,
  onUpdate,
  loadImages,
}: Props) {
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || "");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    activity.image_url || null,
  );

  // 👉 preview + cleanup
  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 👉 drag drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  // 👉 validate file
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB");
      return;
    }
    setFile(file);
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);

    try {
      const activityFilesMap = file ? { [activity.id]: file } : {};

      const updatedActivities = await updateExperienceActivities(
        experienceId,
        [
          {
            ...activity,
            title: title.trim(),
            description: description.trim() || null,
          },
        ],
        activityFilesMap,
      );

      onUpdate(updatedActivities[0]);
      toast.success("Activity updated");

      await loadImages();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const isValid = title.trim() !== "";

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[540px] rounded-2xl shadow-2xl p-6 relative animate-[fadeIn_.2s_ease]">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold">Edit Activity</h2>
        <p className="text-gray-500 text-sm mt-1">
          Update this activity information.
        </p>

        {/* Upload */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="mt-6 flex justify-center"
        >
          {!preview ? (
            <label
              className={`w-44 h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition
              ${
                dragging
                  ? "border-black bg-gray-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <span className="text-sm text-gray-500 mt-2">
                Drag & drop or click
              </span>

              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0]!)}
                disabled={loading}
              />
            </label>
          ) : (
            <label className="relative w-44 h-44 group cursor-pointer block">
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition rounded-2xl">
                <span className="opacity-0 group-hover:opacity-100 transition text-white text-sm font-medium drop-shadow-md">
                  Change Image
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0]!)}
                disabled={loading}
              />
            </label>
          )}
        </div>

        {/* Inputs */}
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium">Activity Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="w-full mt-2 border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="w-full mt-2 border rounded-xl px-4 py-3 h-28 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={!isValid || loading}
            className={`px-5 py-2.5 rounded-xl text-white transition ${
              !isValid || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-800 hover:bg-black"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
