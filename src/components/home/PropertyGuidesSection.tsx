"use client";

import { blogsData } from "@/src/data/blogs";
import { useState } from "react";

export default function PropertyGuidesSection() {
  const [visibleCount, setVisibleCount] = useState(3);
  const displayedBlogs = blogsData.slice(0, visibleCount);
  const hasMoreBlogs = visibleCount < blogsData.length;
  const showButton = blogsData.length > 3;

  const handleViewMore = () => {
    setVisibleCount((prev) => Math.min(prev + 3, blogsData.length));
  };

  const handleViewLess = () => {
    setVisibleCount(3);
  };

  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900">Property Rental</h2>
          <h2 className="text-4xl font-bold text-gray-900">Guides & Tips</h2>
          <div className="mt-3 h-1 w-32 bg-gray-900"></div>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
          {displayedBlogs.map((blog) => (
            <div
              key={blog.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-200 mb-4">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-500">{blog.category}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View More/Less Button */}
        {showButton && (
          <div className="flex justify-center">
            <button
              onClick={hasMoreBlogs ? handleViewMore : handleViewLess}
              className="px-8 py-4 bg-gray-700 text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {hasMoreBlogs ? "View More Blogs" : "View Less"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
