import { supabase } from "@/src/lib/supabase";

const BUCKET = "chat-images";

export const uploadChatImage = async (
  file: File,
  userId: string,
): Promise<string | null> => {
  try {
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (error) {
      console.log(error);
      return null;
    }

    const { data } = await supabase.storage.from(BUCKET).getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
};
