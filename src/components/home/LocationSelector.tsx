"use client";

import { MapPin } from "lucide-react";
import { Province } from "@/src/types/location";

interface LocationSelectorProps {
  provinces: Province[];
  onSelect: (province: Province) => void;
  onClose: () => void;
  searchValue: string;
}

export default function LocationSelector({
  provinces,
  onSelect,
  onClose,
  searchValue,
}: LocationSelectorProps) {
  // Filter provinces based on search value
  const filteredProvinces = provinces.filter((province) =>
    province.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-2xl shadow-lg border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
      {filteredProvinces.length > 0 ? (
        <div className="p-2">
          {filteredProvinces.map((province) => (
            <div
              key={province.code}
              onClick={() => {
                onSelect(province);
                onClose();
              }}
              className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-[#E8F5E9] rounded-xl">
                <MapPin className="w-6 h-6 text-[#328E6E]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{province.name}</p>
                {province.full_name && (
                  <p className="text-sm text-gray-500">{province.full_name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No locations found</p>
        </div>
      )}
    </div>
  );
}
