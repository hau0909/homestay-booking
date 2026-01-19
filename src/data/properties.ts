export type AmenityType = "bedrooms" | "bathrooms" | "parking" | "pets" | "wifi" ;

export interface Amenity {
  type: AmenityType;
  value?: number;
}

export interface PropertyData {
  id: number;
  type: "homestay" | "experience" | "service";
  title: string;
  address: string;
  rating: number;
  image: string;
  avatarImage: string;
  priceMin?: number;
  priceMax?: number;
  amenities?: Amenity[];
}

export const propertiesData: PropertyData[] = [
  {
    id: 1,
    type: "homestay",
    title: "Well Furnished Apartment",
    address: "100 Smart Street, LA, USA",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    avatarImage:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80",
    priceMin: 1000,
    priceMax: 5000,
   amenities: [
      { type: "bedrooms", value: 3 },
      { type: "bathrooms", value: 1 },
      { type: "parking", value: 2 },
      { type: "pets", value: 0 },
       { type: "wifi" },
       { type: "wifi" },
         { type: "wifi" },
      
    ],
  },
  {
    id: 2,
    type: "homestay",
    title: "Comfortable Family Flat",
    address: "100 Smart Street, LA, USA",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    avatarImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    priceMin: 1000,
    priceMax: 5000,
    amenities: [
      { type: "bedrooms", value: 3 },
      { type: "bathrooms", value: 1 },
      { type: "parking", value: 2 },
      { type: "pets", value: 0 },
      { type: "wifi" },
    ],
  },
  {
    id: 3,
    type: "homestay",
    title: "Beach House Summer",
    address: "100 Smart Street, LA, USA",
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800&q=80",
    avatarImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    priceMin: 1000,
    priceMax: 5000,
    amenities: [
      { type: "bedrooms", value: 3 },
      { type: "bathrooms", value: 1 },
      { type: "parking", value: 2 },
      { type: "pets", value: 0 },
      { type: "wifi" },
    ],
  },
  {
    id: 4,
    type: "homestay",
    title: "Double Size Room",
    address: "100 Smart Street, LA, USA",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    avatarImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    priceMin: 1000,
    priceMax: 5000,
    amenities: [
      { type: "bedrooms", value: 3 },
      { type: "bathrooms", value: 1 },
      { type: "parking", value: 2 },
      { type: "pets", value: 0 },
      { type: "wifi" },
    ],
  },
  {
    id: 5,
    type: "homestay",
    title: "Modern Loft",
    address: "100 Smart Street, LA, USA",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    avatarImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    priceMin: 1000,
    priceMax: 5000,
    amenities: [
      { type: "bedrooms", value: 3 },
      { type: "bathrooms", value: 1 },
      { type: "parking", value: 2 },
      { type: "pets", value: 0 },
      { type: "wifi" },
    ],
  },
  {
    id: 6,
    type: "homestay",
    title: "Cozy Studio",
    address: "100 Smart Street, LA, USA",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80",
    avatarImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    priceMin: 1000,
    priceMax: 5000,
    amenities: [
      { type: "bedrooms", value: 3 },
      { type: "bathrooms", value: 1 },
      { type: "parking", value: 2 },
      { type: "pets", value: 0 },
      { type: "wifi" },
    ],
  },
];
