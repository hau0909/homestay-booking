/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { Plus, Image as ImageIcon, Upload, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExperienceActivity } from "@/src/types/experienceActivity";

type Props = {
  experienceId: number;
  value: ExperienceActivity[] | [];
  onChange: (data: ExperienceActivity[]) => void;
  onFileSelect: (id: number, file: File) => void;
};

export default function ExperienceScheduleStep({
  value,
  onChange,
  experienceId,
  onFileSelect,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextId, setNextId] = useState(1);

  // Form state for new activity
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activityId = () => Date.now();

  const handleAddActivity = () => {
    if (!newTitle.trim() || !newDescription.trim() || !newImageFile) return;

    const id = activityId();

    const activityImageUrl = URL.createObjectURL(newImageFile);

    const newActivity: ExperienceActivity = {
      id,
      experience_id: experienceId,
      image_url: activityImageUrl,
      title: newTitle,
      description: newDescription || null,
      sort_order: value.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNextId(nextId + 1);

    onChange([...value, newActivity]);

    onFileSelect(id, newImageFile);

    // Reset form and close modal
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewImageFile(null);
    setPreviewUrl(null);
  };

  const handleDeleteActivity = (id: number) => {
    onChange(
      value
        .filter((a: ExperienceActivity) => a.id !== id)
        .map((a: ExperienceActivity, index: number) => ({
          ...a,
          sort_order: index + 1,
        })),
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setNewImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Plan your experience schedule
        </h2>
        <p className="text-muted-foreground text-sm">
          Add the activities that make up your experience. Guests love to know
          what to expect.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Activities timeline */}
        <div className="lg:col-span-2 space-y-4">
          {value.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <p className="text-slate-500 text-sm">
                No activities added yet. Click the button to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-12 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {value.map((activity, index) => (
                <div
                  key={activity.id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xs font-bold">
                    {index + 1}
                  </div>

                  {/* Content card */}
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex gap-4 items-start">
                    {/* Activity Image */}
                    <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                      {activity.image_url ? (
                        <img
                          src={activity.image_url}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-slate-800 truncate">
                        {activity.title}
                      </h4>
                      {activity.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                      )}
                    </div>

                    {/* Actions: Delete and Reorder */}
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Add Activity Button area */}
        <div className="lg:col-span-1">
          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <button className="w-full aspect-square md:aspect-auto md:h-48 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-slate-700 bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">Add Activity</span>
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>
                  Describe what guests will do during this part of the
                  experience.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Image Upload Area */}
                <div className="flex justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  {previewUrl ? (
                    <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={removeImage}
                          className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-500 transition-colors bg-slate-50"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-medium">Upload Image</span>
                    </button>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Activity Title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g. Board the boat"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    placeholder="e.g. Enjoy a two-hour boat trip on Tonle Sap lake."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="resize-none h-24"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>

                <Button
                  onClick={handleAddActivity}
                  disabled={
                    !newTitle.trim() || !newDescription || !newImageFile
                  }
                >
                  Add Activity
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
