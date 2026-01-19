import { UserRole } from "./enums";

export interface Profile {
  id: string; // uuid
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  role: UserRole;
  is_host: boolean;
  identity_card: string | null;
  created_at: string;
  updated_at: string;
}
