"use client";

import { Button } from "@/components/ui/button";
import { ImagePlus, X, Star } from "lucide-react";
import type { CreateListingForm } from "@/app/hosting/listing/create/page";

const REQUIRED_IMAGES = 5;

/* =======================
   PROPS
======================= */
type Props = {
  data: CreateListingForm;
  onChange: (data: CreateListingForm) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function ImagesStep({
  data,
  onChange,
  onNext,
  onBack,
}: Props) {
  const images = data.images;
  const canFinish = images.length === REQUIRED_IMAGES;

  const handleSelectImages = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const remaining = REQUIRED_IMAGES - images.length;
    if (remaining <= 0) return;

    onChange({
      ...data,
      images: [...images, ...selectedFiles.slice(0, remaining)],
    });

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    onChange({
      ...data,
      images: images.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Card */}
      <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">
            Add photos 
          </h2>
          <p className="text-sm text-muted-foreground">
            Guests love listings with clear and beautiful photos
          </p>
        </div>

        {/* Upload box */}
        <label
          className={`
            flex flex-col items-center justify-center gap-3
            rounded-xl border-2 border-dashed p-10 text-center transition
            ${
              canFinish
                ? "border-slate-200 text-slate-400 cursor-not-allowed"
                : "border-slate-300 hover:border-slate-400 cursor-pointer"
            }
          `}
        >
          <ImagePlus className="h-10 w-10 text-slate-400" />
          <p className="font-medium text-slate-700">
            Upload photos
          </p>
          <p className="text-xs text-slate-500">
            {images.length}/{REQUIRED_IMAGES} images
          </p>

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={canFinish}
            className="hidden"
            onChange={handleSelectImages}
          />
        </label>

        {/* Hint */}
        {!canFinish && (
          <p className="text-sm text-slate-500">
            You need exactly {REQUIRED_IMAGES} images
            {images.length > 0 &&
              ` (add ${REQUIRED_IMAGES - images.length} more)`}
          </p>
        )}

        {/* Preview grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((file, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-xl border"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />

                {/* Thumbnail badge */}
                {index === 0 && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                    <Star className="h-3 w-3" />
                    Cover
                  </div>
                )}

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="
                    absolute right-2 top-2
                    rounded-full bg-black/60 p-1.5 text-white
                    opacity-0 group-hover:opacity-100 transition
                    hover:bg-black
                  "
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>

        <Button onClick={onNext} disabled={!canFinish}>
          Next
        </Button>
      </div>
    </div>
  );
}
