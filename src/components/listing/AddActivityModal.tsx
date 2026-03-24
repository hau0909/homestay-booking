"use client";

import { useState, useCallback } from "react";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import { ListingImage } from "@/src/types/listingImages";
import toast from "react-hot-toast";
import { addExperienceActivitiesKeepOld } from "@/src/services/experience/addExperienceActivitiesKeepOld";

interface Props {
  experienceId: number;
  activities: ExperienceActivity[];
  onClose: () => void;
  onUpdate: (updatedActivities: ExperienceActivity[]) => void;
  onAddImage?: (newImage: ListingImage) => void; // callback để push ảnh mới vào parent state
}

export default function AddActivityModal({
  experienceId,
  activities,
  onClose,
  onUpdate,
  onAddImage,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid =
    title.trim() !== "" && description.trim() !== "" && file !== null;

  // 👉 Drag & Drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleAdd = async () => {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }

    try {
      setLoading(true);

      const newActivity: Omit<ExperienceActivity, "id"> = {
        experience_id: experienceId,
        title: title.trim(),
        description: description.trim() || null,
        image_url: null,
        sort_order: activities.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 🔹 Thêm activity + upload ảnh
      const result = await addExperienceActivitiesKeepOld(
        experienceId,
        newActivity,
        file || undefined,
      );

      toast.success("Activity added");

      // Cập nhật activity list
      onUpdate(result.updatedActivities);

      // Nếu có ảnh mới, push vào parent images
      if (result.newImage && onAddImage) {
        onAddImage(result.newImage);
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Add activity failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[540px] rounded-2xl shadow-2xl p-6 relative animate-[fadeIn_.2s_ease]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold">Add New Activity</h2>
        <p className="text-gray-500 text-sm mt-1">
          Describe what guests will do during this part of the experience.
        </p>

        {/* Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="mt-6 flex justify-center"
        >
          {!file ? (
            <label
              className={`w-44 h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition
              ${dragging ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-400"}`}
            >
              <span className="text-sm text-gray-500 mt-2">Drag or upload</span>

              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
          ) : (
            <label className="relative w-44 h-44 group cursor-pointer block">
              <img
                src={URL.createObjectURL(file)}
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
                onChange={(e) => setFile(e.target.files?.[0] || null)}
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
              placeholder="e.g. Board the boat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-2 border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              placeholder="e.g. Enjoy a two-hour boat trip on Tonle Sap lake."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 border rounded-xl px-4 py-3 h-28 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black resize-none transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!isValid || loading}
            className={`px-5 py-2.5 rounded-xl text-white transition ${
              !isValid || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-800 hover:bg-black"
            }`}
          >
            {loading ? "Adding..." : "Add Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}
