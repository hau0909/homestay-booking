"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpDown, Check } from "lucide-react";

export type SortOption = "price_low" | "price_high" | "newest" | "rating";

interface SortDropdownProps {
  value: SortOption[];
  onChange: (value: SortOption[]) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string; description: string }[] = [
  { value: "newest", label: "Newest", description: "Most recently added" },
  { value: "price_low", label: "Price: Low to High", description: "Cheapest first" },
  { value: "price_high", label: "Price: High to Low", description: "Most expensive first" },
  { value: "rating", label: "Top Rated", description: "Highest rated first" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const selectedCount = value.length;
  const buttonLabel = selectedCount > 0 ? `Sort (${selectedCount})` : "Sort";

  const isPriceLowSelected = value.includes("price_low");
  const isPriceHighSelected = value.includes("price_high");

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sort Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all bg-white ${
          isOpen 
            ? "border-black shadow-md" 
            : "border-gray-300 hover:border-gray-400 hover:shadow-sm"
        }`}
      >
        <ArrowUpDown size={16} />
        <span className="text-sm font-medium">{buttonLabel}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Sort by</h3>
            </div>
            
            <div className="py-1">
              {SORT_OPTIONS.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled = 
                  (option.value === "price_low" && isPriceHighSelected) ||
                  (option.value === "price_high" && isPriceLowSelected);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (isDisabled) return;
                      const newValue = isSelected
                        ? value.filter(v => v !== option.value)
                        : [...value, option.value];
                      onChange(newValue);
                      // Don't close on selection to allow multiple
                    }}
                    disabled={isDisabled}
                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                      isSelected 
                        ? "bg-gray-50" 
                        : isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className={`text-sm ${isSelected ? "font-semibold text-black" : "text-gray-700"}`}>
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {option.description}
                      </span>
                    </div>
                    
                    {/* Checkbox-style indicator */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? "border-emerald-600 bg-emerald-600" 
                        : "border-gray-300"
                    }`}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
