"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function HouseRulesStep({
  data,
  onChange,
  onNext,
  onBack,
}: Props) {
  const rules: string[] = data.rules || [];

  const [input, setInput] = useState("");

  /* =========================
     ADD RULE
  ========================== */
  const addRule = () => {
    const value = input.trim();
    if (!value) return;

    // tránh trùng
    const exists = rules.some(
      (r) => r.toLowerCase().trim() === value.toLowerCase(),
    );

    if (exists) {
      setInput("");
      return;
    }

    onChange({
      ...data,
      rules: [...rules, value],
    });

    setInput("");
  };

  /* =========================
     REMOVE RULE
  ========================== */
  const removeRule = (index: number) => {
    onChange({
      ...data,
      rules: rules.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="border rounded-2xl p-6 bg-white space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">House rules</h2>
        <p className="text-sm text-gray-500">Add rules guests must follow</p>
      </div>

      {/* INPUT */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="No smoking, No pets..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-3
                     focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          type="button"
          onClick={addRule}
          disabled={!input.trim()}
          className="px-5 rounded-full border text-sm font-medium
                     disabled:opacity-40
                     hover:bg-gray-100"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      {rules.length > 0 && (
        <div className="space-y-3">
          <div className="border border-gray-300 bg-gray-50 rounded-xl divide-y">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="px-4 py-4 flex justify-between items-center
                           bg-white first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="font-medium text-gray-900">{rule}</span>

                <button
                  onClick={() => removeRule(index)}
                  className="w-8 h-8 flex items-center justify-center
                             rounded-full text-gray-500
                             hover:bg-gray-200 hover:text-black"
                >
                  ×
                </button>
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
