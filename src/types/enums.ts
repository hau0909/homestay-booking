export type UserRole = "USER" | "ADMIN";

export type ListingType = "HOME" | "EXPERIENCE";

export type ListingStatus =
  | "DRAFT"
  | "PENDING"
  | "ACTIVE"
  | "HIDDEN"
  | "BANNED";

export type BookingStatus =
  | "DRAFT"
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export type AmenityType = "HOME" | "EXP" | "BOTH";

export type requestHostStatus = "PENDING" | "APPROVED" | "REJECTED";
