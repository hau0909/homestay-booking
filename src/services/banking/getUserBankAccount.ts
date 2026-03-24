import { supabase } from "@/src/lib/supabase";
import { BankAccount } from "@/src/types/bankAccount";

export const getUserBankAccount = async (user_id: string): Promise<BankAccount | null> => {
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .eq("profile_id", user_id)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 is no rows
  return data;
};
