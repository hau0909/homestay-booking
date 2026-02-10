import { requestHostStatus } from "./enums";

export interface HostApplication {
  id: string; // uuid
  user_id: string; // uuid
  identity_card_front_url: string;
  identity_card_back_url: string;
  status: requestHostStatus;
  created_at: string;
  updated_at: string;
}
