export interface BankAccount {
  id: number;
  profile_id: string; // uuid
  bank_name: string;
  account_number: string;
  account_name: string;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}
