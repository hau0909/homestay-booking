"use client";

export default function BrowsePropertiesBanner() {
  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-3xl overflow-hidden min-h-[400px]">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"
            alt="Browse Properties"
            className="absolute inset-0 w-full h-full object-cover "
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full px-12 py-16 lg:px-20 lg:py-24">
            <h2 className="text-5xl lg:text-6xl font-bold text-black mb-4">
              Browse For
            </h2>
            <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6">
              More Properties
            </h2>
            <p className="text-lg text-black mb-8 max-w-md font-bold">
              Explore properties by their categories/types...
            </p>
            <div>
              <a href="#">
                <button className="px-8 py-4 bg-black hover:cursor-pointer text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
                  Find A Property
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
