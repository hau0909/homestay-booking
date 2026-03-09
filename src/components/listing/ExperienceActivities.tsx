import React, { useState } from "react";
import { ExperienceActivity } from "@/src/types/experienceActivity";
import ExperienceActivityModal from "./ExperienceActivityModal";

interface ExperienceActivitiesProps {
  activities: ExperienceActivity[];
}

export default function ExperienceActivities({
  activities,
}: ExperienceActivitiesProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!activities || activities.length === 0) return null;

  const handleActivityClick = (index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  };

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold mb-6 text-black border-b border-gray-200 pb-2">
        Detailed activity schedule
      </h3>
      <div className="flex flex-col gap-8 relative">
        <div className="absolute left-[36px] top-4 bottom-4 w-[1px] bg-gray-200"></div>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="relative z-10 flex gap-6 mt-2 cursor-pointer group"
            onClick={() => handleActivityClick(index)}
          >
            <div className="shrink-0 w-[72px] h-[72px] bg-white rounded-2xl p-1 z-10 flex items-center justify-center -ml-1 transition-transform group-hover:scale-105">
               <img
                  src={activity.image_url!}
                  alt={activity.title || "Activity photo"}
                  className="w-full h-full object-cover rounded-xl shadow-sm"
                />
            </div>
            
            <div className="flex flex-col justify-center pt-2 pb-6 w-full">
              <h4 className="text-lg font-medium text-gray-900 mb-1">
                {activity.title}
              </h4>
              <p className="text-gray-600 text-[15px] leading-relaxed w-full">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <ExperienceActivityModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          activities={activities}
          initialActivityIndex={selectedIndex}
        />
      )}
    </div>
  );
}
