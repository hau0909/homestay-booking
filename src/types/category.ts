import { ListingType } from "./enums";

export interface Category {
  id: number;
  name: string;
  type: ListingType;
  image_url: string | null;
}
