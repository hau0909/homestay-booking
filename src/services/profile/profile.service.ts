// ...existing code...
import { supabase } from "@/src/lib/supabase";
import { Profile } from "@/src/types/profile";
import { da } from "date-fns/locale";

/**
 * Get user profile by user ID
 */
export const getProfile = async (userId: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (!data) {
    throw new Error("Profile not found");
  }

  return data;
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Profile>,
): Promise<Profile> => {
  // Remove fields that shouldn't be updated directly
  const { id, email, created_at, role, ...allowedUpdates } = updates;

  // Add updated_at timestamp
  const profileData = {
    ...allowedUpdates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  if (!data) {
    throw new Error("Profile update failed");
  }

  return data;
};

/**
 * Upload avatar image
 */
export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);

    // If bucket doesn't exist, provide helpful error message
    if (uploadError.message.includes("Bucket not found")) {
      throw new Error(
        "Storage bucket not configured. Please create 'avatars' bucket in Supabase Dashboard → Storage",
      );
    }

    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): boolean => {
  // Vietnamese phone number format: 0xxxxxxxxx (10 digits)
  const phoneRegex = /^0[0-9]{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate identity card format
 */
export const validateIdentityCard = (identityCard: string): boolean => {
  // Vietnamese identity card: 9 or 12 digits
  const idRegex = /^[0-9]{9}$|^[0-9]{12}$/;
  return idRegex.test(identityCard);
};

export const checkCurrentPassword = async (currentPassword: string) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (error) {
    throw new Error("Current password is incorrect");
  }

  return true;
};

export const changePassword = async (newpassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newpassword,
  });

  if (error) throw error;

  return data;
};
