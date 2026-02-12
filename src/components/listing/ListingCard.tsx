import React from 'react';

interface ListingCardProps {
  id: string;
  title: string;
  image: string;
  averageRating: number;
  location: string;
  price: number;
}

const ListingCard: React.FC<ListingCardProps> = ({ title, image, averageRating, location, price }) => {
  return (
    <div className="border rounded-lg shadow-md overflow-hidden">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-yellow-500 font-bold">Rating: {averageRating}</div>
        <div className="text-gray-600">{location}</div>
        <div className="text-blue-600 font-bold mt-2">${price}</div>
      </div>
    </div>
  );
};

export default ListingCard;
