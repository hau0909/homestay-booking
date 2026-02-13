"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Fee = {
  title: string;
  price: number;
};

type Props = {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function ExtraFeesStep({
  data,
  onChange,
  onNext,
  onBack,
}: Props) {
  const fees: Fee[] = data.fees || [];

  const [inputFee, setInputFee] = useState({
    title: "",
    price: "",
  });

  const setFees = (fees: Fee[]) => {
    onChange({ ...data, fees });
  };

  const addFee = () => {
    const priceNumber = Number(inputFee.price);

    if (!inputFee.title.trim()) return;
    if (!priceNumber || priceNumber <= 0) return;

    setFees([...fees, { title: inputFee.title, price: priceNumber }]);
    setInputFee({ title: "", price: "" });
  };

  const removeFee = (index: number) => {
    setFees(fees.filter((_, i) => i !== index));
  };

  return (
    <div className="border rounded-2xl p-6 bg-white space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Extra fees</h2>
        <p className="text-sm text-gray-500">
          Add optional fees guests may need to pay.
        </p>
      </div>

      {/* INPUT ROW */}
      <div className="flex items-end gap-4">
        {/* FEE NAME */}
        <div className="flex-[3]">
          <label className="block text-sm font-medium mb-1">
            Fee name
          </label>
          <input
            type="text"
            placeholder="Cleaning fee, pet fee…"
            value={inputFee.title}
            onChange={(e) =>
              setInputFee({ ...inputFee, title: e.target.value })
            }
            className="w-full border rounded-lg px-4 py-3
                       focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* PRICE */}
        <div className="flex-[1.5]">
          <label className="block text-sm font-medium mb-1">
            Price
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={inputFee.price}
              onChange={(e) =>
                setInputFee({
                  ...inputFee,
                  price: e.target.value.replace(/[^\d]/g, ""),
                })
              }
              className="w-full border rounded-lg px-4 pr-12 py-3
                         focus:outline-none focus:ring-2 focus:ring-black"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-500 text-sm pointer-events-none">
              USD
            </span>
          </div>
        </div>

        {/* ADD BUTTON */}
        <div className="pb-[2px]">
          <button
            type="button"
            onClick={addFee}
            disabled={!inputFee.title || !inputFee.price}
            className="h-[46px] px-5 rounded-full border
                       text-sm font-medium
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-gray-100"
          >
            Add
          </button>
        </div>
      </div>

      {/* FEES LIST */}
      {fees.length > 0 && (
        <div className="space-y-3">
          {/* LIST DESCRIPTION */}
          <p className="text-xs text-gray-500">
            These fees will be shown separately to guests during checkout.
          </p>

          <div className="border border-gray-300 bg-gray-50 rounded-xl divide-y">
            {fees.map((fee, index) => (
              <div
                key={index}
                className="px-4 py-4 flex justify-between items-center
                           bg-white first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="font-medium text-gray-900">
                  {fee.title}
                </span>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">
                    ${fee.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFee(index)}
                    className="w-8 h-8 flex items-center justify-center rounded-full
                               text-gray-500 hover:bg-gray-200 hover:text-black"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-black text-white hover:bg-gray-800"
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
