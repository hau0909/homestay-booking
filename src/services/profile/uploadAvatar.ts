import { supabase } from "@/src/lib/supabase";

/**
 * Upload avatar to Supabase Storage and return public URL
 * @param userId - User's unique id
 * @param file - File object (image)
 * @returns public URL string
 */
export const uploadAvatar = async (userId: string, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  // Upload file to 'avatar' bucket
  const { error } = await supabase.storage
    .from('avatar')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    throw new Error('Failed to upload avatar: ' + error.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(filePath);
  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for avatar');
  }
  return urlData.publicUrl;
};
