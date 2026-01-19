export interface BlogData {
  id: number;
  title: string;
  category: string;
  image: string;
}

export const blogsData: BlogData[] = [
  {
    id: 1,
    title: "Choose the right property!",
    category: "Economy",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
  },
  {
    id: 2,
    title: "Best environment for rental",
    category: "Lifestyle",
    image:
      "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&q=80",
  },
  {
    id: 3,
    title: "Boys Hostel Apartment",
    category: "Property",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    },
  
];
