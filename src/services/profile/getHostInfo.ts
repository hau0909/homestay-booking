import { supabase } from "@/src/lib/supabase";

export interface HostInfo {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_host: boolean;
  created_at: string;
}

export async function getHostInfo(hostId: string): Promise<HostInfo | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", hostId)
      .single();

    if (error) {
      console.error("getHostInfo error:", error);
      return null;
    }

    return data as HostInfo;
  } catch (error) {
    console.error("getHostInfo unexpected error:", error);
    return null;
  }
}
