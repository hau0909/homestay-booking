import { supabase } from "@/src/lib/supabase";

export async function createBasicInfo(data: {
  host_id: string;
  category_id: number;
  title: string;
  description: string;
  listing_type: "HOME";
}) {
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...data,
      status: "DRAFT",
    })
    .select()  //“Sau khi insert, trả về bản ghi vừa tạo”
    .single();  //trả về 1 oject chứ k mảng

  if (error) throw error;
  return listing;
}
