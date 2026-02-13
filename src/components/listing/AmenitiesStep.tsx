"use client";

import { useEffect, useState } from "react";
import { Amenity } from "@/src/types/amenity";
import { getAmenities } from "@/src/services/listing/getAmenities";
import { Button } from "@/components/ui/button";

type Props = {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function AmenitiesStep({
  data,
  onChange,
  onNext,
  onBack,
}: Props) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  // lấy danh sách amenities khi mở step
  useEffect(() => {
    async function fetchAmenities() {
      const res = await getAmenities();
      setAmenities(res);
    }

    fetchAmenities();
  }, []);

  // bật / tắt 1 amenity
  function toggleAmenity(id: number) {
    const selected = data.amenity_ids.includes(id);

    if (selected) {
      // bỏ chọn
      onChange({
        ...data,
        amenity_ids: data.amenity_ids.filter(
          (item: number) => item !== id
        ),
      });
    } else {
      // chọn
      onChange({
        ...data,
        amenity_ids: [...data.amenity_ids, id],
      });
    }
  }

  return (
    <div className="border rounded-xl p-6 space-y-6">
      {/* TITLE */}
      <div>
        <h2 className="text-xl font-semibold">Amenities</h2>
        <p className="text-sm text-gray-500">
          Select the amenities your place offers
        </p>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-2 gap-4">
        {amenities.map((a) => {
          const active = data.amenity_ids.includes(a.id);

          return (
            <div
              key={a.id}
              onClick={() => toggleAmenity(a.id)}
              className={`
                flex items-center gap-3
                border rounded-lg p-4 cursor-pointer
                ${active ? "border-black bg-gray-100" : "border-gray-300"}
              `}
            >
              {/* ICON */}
              {a.icon_url ? (
                <img
                  src={a.icon_url}
                  alt={a.name}
                  className="w-6 h-6"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded" />
              )}

              {/* NAME */}
              <span className="text-sm font-medium">{a.name}</span>
            </div>
          );
        })}
      </div>

      {/* ACTION */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}
