import { DateRange } from "react-day-picker";

export function getDatesFromRange(range: DateRange): Date[] {
  if (!range.from || !range.to) return [];

  const dates: Date[] = [];
  const current = new Date(range.from);

  while (current < range.to) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
