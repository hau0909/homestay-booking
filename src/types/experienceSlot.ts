export type ExperienceSlotStatus = "OPEN" | "FULL" | "CANCELLED";

export interface ExperienceSlot {
  id: number;
  listing_id: number;
  start_time: string;
  end_time: string;
  max_attendees: number;
  booked_count: number;
  status: ExperienceSlotStatus;
}
