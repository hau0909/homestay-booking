"use client";

export default function DiscoverMoreSection() {
  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-5xl font-bold text-gray-900 mb-2">
                Discover More About
              </h2>
              <h2 className="text-5xl font-bold text-gray-900">
                Property Rental
              </h2>
              <div className="mt-4 h-1 w-44 bg-gray-900"></div>
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              At vero eos et accusamus et iusto odio dignissimos ducimus qui
              blanditiis praesentium voluptatum deleniti atque corrupti quos
              dolores et quas molestias excepturi sint occaecati cupiditate non
              provident, similique sunt in culpa qui officia deserunt mollitia
              animi, id est laborum et dolorum fuga.
            </p>

            <div className="flex gap-8 mb-10">
              <button className="text-gray-900 font-semibold text-lg hover:text-gray-600 transition-colors">
                Ask A Question
              </button>
              <button className="text-gray-900 font-semibold text-lg hover:text-gray-600 transition-colors">
                Find A Property
              </button>
            </div>

            <div>
              <button className="px-8 py-4 hover:cursor-pointer bg-gray-700 text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors">
                Discover More
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative aspect-[4/3] rounded-3xl bg-gray-200 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"
              alt="Property Rental"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
