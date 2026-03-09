import React, { useEffect, useState } from "react";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import { X } from "lucide-react";

interface ExperienceActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ExperienceActivity[];
  initialActivityIndex: number;
}

export default function ExperienceActivityModal({
  isOpen,
  onClose,
  activities,
  initialActivityIndex,
}: ExperienceActivityModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialActivityIndex);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(initialActivityIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialActivityIndex]);

  if (!isOpen || activities.length === 0) return null;

  const currentActivity = activities[selectedIndex];

  // Close modal when clicking on the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[1000px] h-full max-h-[600px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-800" />
        </button>

        {/* Sidebar thumbnails (Desktop) */}
        <div className="hidden md:flex flex-col gap-4 p-6 pr-0 overflow-y-auto no-scrollbar justify-center shrink-0">
          {activities.map((activity, index) => (
            <button
              key={activity.id}
              onClick={() => setSelectedIndex(index)}
              className={`w-16 h-16 rounded-2xl overflow-hidden shrink-0 transition-all border-2 ${
                selectedIndex === index
                  ? "border-black shadow-md scale-105"
                  : "border-transparent hover:border-gray-300 hover:scale-105"
              }`}
            >
              <img
                src={activity.image_url!}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white m-0 md:m-4 rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-0 md:p-6 gap-8">
          {/* Main Image */}
          <div className="w-full md:w-1/2 h-64 md:h-full shrink-0 relative">
            <img
              src={currentActivity.image_url!}
              alt={currentActivity.title}
              className="w-full h-full object-cover md:rounded-2xl"
            />
          </div>

          {/* Text Content */}
          <div className="flex-1 flex flex-col justify-center p-6 md:p-0 overflow-y-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-6 text-center md:text-left">
              {currentActivity.title}
            </h2>
            <p className="text-gray-600 text-base leading-relaxed text-center md:text-left">
              {currentActivity.description}
            </p>
          </div>
        </div>

        {/* Bottom thumbnails (Mobile only) */}
        <div className="md:hidden flex gap-4 p-4 overflow-x-auto no-scrollbar border-t border-gray-100 shrink-0">
          {activities.map((activity, index) => (
            <button
              key={activity.id}
              onClick={() => setSelectedIndex(index)}
              className={`w-14 h-14 rounded-full overflow-hidden shrink-0 transition-all border-2 ${
                selectedIndex === index
                  ? "border-black shadow-md"
                  : "border-transparent opacity-70"
              }`}
            >
              <img
                src={activity.image_url!}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
