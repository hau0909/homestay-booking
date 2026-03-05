export interface ExperienceSlot {
  id: number;
  experience_id: number;

  start_time: string;
  end_time: string;

  max_attendees: number;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}
