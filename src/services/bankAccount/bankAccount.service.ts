import { supabase } from "@/src/lib/supabase";


export const upsertBankAccount = async (
  profile_id: string,
  bankInfo: {
    bank_name: string;
    account_name: string;
    account_number: string;
  }
) => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .upsert([{ profile_id, ...bankInfo }], { onConflict: "profile_id" });
  if (error) {
    // Đảm bảo luôn trả về error có message rõ ràng
    const msg = error.message || JSON.stringify(error) || "Unknown error when updating bank account";
    throw new Error(msg);
  }
  return data;
};

// Lấy thông tin ngân hàng theo profile_id
export const getBankAccountByProfileId = async (profile_id: string) => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("bank_name, account_name, account_number")
    .eq("profile_id", profile_id)
    .single();
  if (error) throw error;
  return data;
};
