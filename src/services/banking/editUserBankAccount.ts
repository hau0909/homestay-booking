import { supabase } from "@/src/lib/supabase";
import { BankAccount } from "@/src/types/bankAccount";

export const editUserBankAccount = async (
  user_id: string,
  bankInfo: Pick<BankAccount, "bank_name" | "account_name" | "account_number">
): Promise<BankAccount> => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .upsert([{ profile_id: user_id, ...bankInfo }], { onConflict: "profile_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to edit bank account");
  }
  
  return data;
};
