"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface GuestSelectorProps {
  onClose?: () => void;
  onGuestsChange?: (guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  }) => void;
  initialValues?: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
}

interface GuestItemProps {
  title: string;
  subtitle: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const GuestItem = ({
  title,
  subtitle,
  value,
  onIncrement,
  onDecrement,
}: GuestItemProps) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    <div className="flex items-center gap-4">
      <button
        onClick={onDecrement}
        disabled={value === 0}
        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 ${
          value === 0
            ? "border-gray-200 text-gray-300 cursor-not-allowed"
            : "border-gray-400 text-gray-700 hover:border-gray-900 hover:bg-gray-50"
        }`}
      >
        <Minus size={16} />
      </button>
      <span className="w-8 text-center text-lg font-medium text-gray-900">
        {value}
      </span>
      <button
        onClick={onIncrement}
        className="w-10 h-10 rounded-full border border-gray-400 text-gray-700 flex items-center justify-center hover:border-gray-900 hover:bg-gray-50 transition-all duration-200"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
);

export default function GuestSelector({
  onClose,
  onGuestsChange,
  initialValues,
}: GuestSelectorProps) {
  const [adults, setAdults] = useState(initialValues?.adults || 0);
  const [children, setChildren] = useState(initialValues?.children || 0);
  const [infants, setInfants] = useState(initialValues?.infants || 0);
  const [pets, setPets] = useState(initialValues?.pets || 0);

  const notifyChange = (
    newAdults: number,
    newChildren: number,
    newInfants: number,
    newPets: number,
  ) => {
    onGuestsChange?.({
      adults: newAdults,
      children: newChildren,
      infants: newInfants,
      pets: newPets,
    });
  };

  const increment = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    type: "adults" | "children" | "infants" | "pets",
  ) => {
    const newValue = value + 1;
    setter(newValue);

    const updates = { adults, children, infants, pets, [type]: newValue };
    notifyChange(
      updates.adults,
      updates.children,
      updates.infants,
      updates.pets,
    );
  };

  const decrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    type: "adults" | "children" | "infants" | "pets",
  ) => {
    if (value > 0) {
      const newValue = value - 1;
      setter(newValue);

      const updates = { adults, children, infants, pets, [type]: newValue };
      notifyChange(
        updates.adults,
        updates.children,
        updates.infants,
        updates.pets,
      );
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-3xl shadow-2xl z-50 p-6">
      <GuestItem
        title="Adults"
        subtitle="Ages 13 or above"
        value={adults}
        onIncrement={() => increment(setAdults, adults, "adults")}
        onDecrement={() => decrement(setAdults, adults, "adults")}
      />
      <GuestItem
        title="Children"
        subtitle="Ages 2 – 12"
        value={children}
        onIncrement={() => increment(setChildren, children, "children")}
        onDecrement={() => decrement(setChildren, children, "children")}
      />
      <GuestItem
        title="Infants"
        subtitle="Under 2"
        value={infants}
        onIncrement={() => increment(setInfants, infants, "infants")}
        onDecrement={() => decrement(setInfants, infants, "infants")}
      />
      <GuestItem
        title="Pets"
        subtitle="Bringing a service animal?"
        value={pets}
        onIncrement={() => increment(setPets, pets, "pets")}
        onDecrement={() => decrement(setPets, pets, "pets")}
      />
    </div>
  );
}
