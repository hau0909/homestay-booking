import React from 'react';
import TopRatedListings from './TopRatedListings';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to Homestay Booking</h1>
      <TopRatedListings />
    </div>
  );
};

export default Home;
