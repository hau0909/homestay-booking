"use client";

import { useState, useRef, useEffect } from "react";
import { Profile } from "@/src/types/profile";
import { User, Camera, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  updateProfile,
  uploadAvatar,
  validatePhone,
  validateIdentityCard,
} from "@/src/services/profile/profile.service";
import { getUserBankAccount } from "@/src/services/banking/getUserBankAccount";
import { editUserBankAccount } from "@/src/services/banking/editUserBankAccount";
import toast from "react-hot-toast";
import banksData from "@/src/data/banks.json";

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
    bank_name: "",
    account_name: "",
    account_number: "",
  });

  // Lấy thông tin ngân hàng khi là host
  useEffect(() => {
    if (profile.is_host) {
      getUserBankAccount(profile.id)
        .then((bank) => {
          if (bank)
            setFormData((prev) => ({
              ...prev,
              bank_name: bank.bank_name || "",
              account_name: bank.account_name || "",
              account_number: bank.account_number || "",
            }));
        })
        .catch(() => {});
    }
  }, [profile.id, profile.is_host]);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

      {
        /* Bank Name (Host only) */
      }
      {
        profile.is_host && (
          <div>
            <label
              htmlFor="bank_name"
              className="block text-sm font-medium text-gray-700"
            >
              Bank Name
            </label>
            <input
              type="text"
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              placeholder="Enter your bank name"
            />
          </div>
        );
      }

      {
        /* Bank Account Name (Host only) */
      }
      {
        profile.is_host && (
          <div>
            <label
              htmlFor="bank_account_name"
              className="block text-sm font-medium text-gray-700"
            >
              Bank Account Name
            </label>
            <input
              type="text"
              id="bank_account_name"
              name="bank_account_name"
              value={formData.account_name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              placeholder="Enter your bank account name"
            />
          </div>
        );
      }

      {
        /* Bank Account Number (Host only) */
      }
      {
        profile.is_host && (
          <div>
            <label
              htmlFor="bank_account_number"
              className="block text-sm font-medium text-gray-700"
            >
              Bank Account Number
            </label>
            <input
              type="text"
              id="bank_account_number"
              name="bank_account_number"
              value={formData.account_number}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              placeholder="Enter your bank account number"
            />
          </div>
        );
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
      newErrors.phone =
        "Invalid phone number format (must be 10 digits, e.g., 0123456789)";
    }

    // Validate identity card (if provided)
    if (
      formData.identity_card &&
      !validateIdentityCard(formData.identity_card)
    ) {
      newErrors.identity_card =
        "Invalid identity card (must be 9 or 12 digits)";
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
          const { uploadAvatar } =
            await import("@/src/services/profile/uploadAvatar");
          avatarUrl = await uploadAvatar(profile.id, selectedFile);
          toast.dismiss(uploadingToast);
          toast.success("Avatar uploaded!");
        } catch (uploadError) {
          toast.dismiss(uploadingToast);
          const msg =
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload avatar";
          toast.error(msg);
          console.error("Avatar upload error:", uploadError);
        }
      }

      // Update profile (không bao gồm thông tin ngân hàng)
      const { bank_name, account_name, account_number, ...profileData } =
        formData;
      let updatedProfile;
      try {
        updatedProfile = await updateProfile(profile.id, {
          ...profileData,
          avatar_url: avatarUrl,
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to update profile";
        toast.error(msg);
        console.error("Error updating profile:", err);
        return;
      }

      // Nếu là host thì cập nhật thông tin ngân hàng vào bảng bank_accounts
      if (profile.is_host) {
        try {
          await editUserBankAccount(profile.id, {
            bank_name,
            account_name,
            account_number,
          });
        } catch (err) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to update bank account";
          toast.error(msg);
          console.error("Error updating bank account:", err);
          return;
        }
      }

      onSave(updatedProfile);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(msg);
      console.error("Error updating profile:", error);
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
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
            title="Click to change avatar"
          >
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
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
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
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
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
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
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
          <label
            htmlFor="identity_card"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
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

        {/* Bank Name (Host only) */}
        {profile.is_host && (
          <div className="mb-4">
            <label
              htmlFor="bank_name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bank Name
            </label>
            <select
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleInputChange as any}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
            >
              <option value="" disabled>Select a bank</option>
              {banksData.data.map((bank) => (
                <option key={bank.code} value={bank.short_name}>
                  {bank.short_name} - {bank.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Account Name (Host only) */}
        {profile.is_host && (
          <div className="mb-4">
            <label
              htmlFor="account_name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Name
            </label>
            <input
              type="text"
              id="account_name"
              name="account_name"
              value={formData.account_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Enter your account name"
            />
          </div>
        )}

        {/* Account Number (Host only) */}
        {profile.is_host && (
          <div className="mb-6">
            <label
              htmlFor="account_number"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Number
            </label>
            <input
              type="text"
              id="account_number"
              name="account_number"
              value={formData.account_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Enter your account number"
            />
          </div>
        )}

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
