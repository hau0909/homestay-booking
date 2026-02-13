import { supabase } from "@/src/lib/supabase";

const BUCKET = "identity-cards";

export const uploadIdentityCardFront = async (
  userId: string,
  file: File,
): Promise<string> => {
  return uploadIdentity(userId, file, "front");
};

export const uploadIdentityCardBack = async (
  userId: string,
  file: File,
): Promise<string> => {
  return uploadIdentity(userId, file, "back");
};

export const uploadIdentity = async (
  userId: string,
  file: File,
  side: "front" | "back",
): Promise<string> => {
  const ext = file.name.split(".").pop();
  const filePath = `${userId}/${side}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = await supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return data.publicUrl;
};
