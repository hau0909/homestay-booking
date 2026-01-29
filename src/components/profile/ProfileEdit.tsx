"use client";

import { useState, useRef } from "react";
import { Profile } from "@/src/types/profile";
import { User, Camera, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateProfile,
  uploadAvatar,
  validatePhone,
  validateIdentityCard,
} from "@/src/services/profile/profile.service";
import toast from "react-hot-toast";

interface ProfileEditProps {
  profile: Profile;
  onSave: (updatedProfile: Profile) => void;
  onCancel: () => void;
}

export default function ProfileEdit({
  profile,
  onSave,
  onCancel,
}: ProfileEditProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    identity_card: profile.identity_card || "",
    avatar_url: profile.avatar_url || "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }

    // Validate phone (if provided)
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Invalid phone number format (must be 10 digits, e.g., 0123456789)";
    }

    // Validate identity card (if provided)
    if (formData.identity_card && !validateIdentityCard(formData.identity_card)) {
      newErrors.identity_card = "Invalid identity card (must be 9 or 12 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      setLoading(true);

      let avatarUrl = formData.avatar_url;

      // Thực hiện upload avatar nếu có file mới
      if (selectedFile) {
        const uploadingToast = toast.loading("Uploading avatar...");
        try {
          // Import đúng hàm uploadAvatar từ uploadAvatar.ts nếu cần
          const { uploadAvatar } = await import("@/src/services/profile/uploadAvatar");
          avatarUrl = await uploadAvatar(profile.id, selectedFile);
          toast.dismiss(uploadingToast);
          toast.success("Avatar uploaded!");
        } catch (uploadError) {
          toast.dismiss(uploadingToast);
          toast.error(
            uploadError instanceof Error 
              ? uploadError.message 
              : "Failed to upload avatar"
          );
          console.error("Avatar upload error:", uploadError);
        }
      }

      // Update profile
      const updatedProfile = await updateProfile(profile.id, {
        ...formData,
        avatar_url: avatarUrl,
      });

      onSave(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-black px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Avatar Upload - Clickable */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Click to change avatar">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 group-hover:opacity-70 transition"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center group-hover:opacity-70 transition">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="mt-2 text-sm text-gray-500">
            Click avatar to upload/change (max 5MB)
          </p>
        </div>

        {/* Full Name */}
        <div className="mb-4">
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.full_name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your full name"
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
          )}
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0123456789"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Identity Card */}
        <div className="mb-6">
          <label htmlFor="identity_card" className="block text-sm font-medium text-gray-700 mb-2">
            Identity Card
          </label>
          <input
            type="text"
            id="identity_card"
            name="identity_card"
            value={formData.identity_card}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.identity_card ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="123456789 or 123456789012"
          />
          {errors.identity_card && (
            <p className="mt-1 text-sm text-red-500">{errors.identity_card}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
