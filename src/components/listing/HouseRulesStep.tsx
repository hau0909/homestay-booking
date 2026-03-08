/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Rule } from "@/src/types/rule";
import { getRules } from "@/src/services/listing/getRules";
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
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH RULES
  ========================== */
  useEffect(() => {
    async function fetchRules() {
      try {
        const res = await getRules();
        setRules(res);
      } catch (err) {
        console.error("Failed to load rules:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRules();
  }, []);

  /* =========================
     TOGGLE RULE
  ========================== */
  function toggleRule(id: number) {
    const selected = data.rule_ids.includes(id);

    if (selected) {
      onChange({
        ...data,
        rule_ids: data.rule_ids.filter(
          (item: number) => item !== id
        ),
      });
    } else {
      onChange({
        ...data,
        rule_ids: [...data.rule_ids, id],
      });
    }
  }


  /* =========================
     UI
  ========================== */
  return (
    <div className="border rounded-xl p-6 space-y-6">
      
      {/* TITLE */}
      <div>
        <h2 className="text-xl font-semibold">House Rules</h2>
        <p className="text-sm text-gray-500">
          Select the rules guests must follow during their stay
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-sm text-gray-400">
          Loading rules...
        </div>
      )}

      {/* RULE LIST */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const active = data.rule_ids.includes(rule.id);

            return (
              <div
                key={rule.id}
                onClick={() => toggleRule(rule.id)}
                className={`
                  border rounded-lg p-4 cursor-pointer
                  transition-all duration-200
                  flex items-center justify-between
                  ${
                    active
                      ? "border-black bg-gray-100"
                      : "border-gray-300 hover:border-black"
                  }
                `}
              >
                <span className="text-sm font-medium">
                  {rule.content}
                </span>

                {active && (
                  <span className="text-xs font-semibold">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>

        <Button onClick={onNext} disabled={loading}>
          Next
        </Button>
      </div>
    </div>
  );
}