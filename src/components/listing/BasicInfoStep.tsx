"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreateListingForm } from "@/app/hosting/listing/create/page";

type Props = {
  data: CreateListingForm;
  onChange: (next: CreateListingForm) => void;
  onNext: () => void;
};

export default function BasicInfoStep({
  data,
  onChange,
  onNext,
}: Props) {
  return (
    <div className="space-y-8 rounded-2xl border p-8 shadow-sm">
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">Basic information</h2>
        <p className="text-sm text-muted-foreground">
          Start by giving your place a title and a short description.
        </p>
      </div>

      {/* TITLE */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Listing title</label>
        <Input
          placeholder="Cozy homestay near the beach"
          value={data.title}
          onChange={(e) =>
            onChange({
              ...data,
              title: e.target.value,
            })
          }
        />
        <p className="text-xs text-muted-foreground">
          A short, catchy title works best.
        </p>
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Tell guests what makes your place special..."
          value={data.description}
          rows={5}
          maxLength={500}
          onChange={(e) =>
            onChange({
              ...data,
              description: e.target.value,
            })
          }
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Share key features, vibe, or nearby attractions.</span>
          <span>{data.description.length}/500</span>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!data.title.trim() || !data.description.trim()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
