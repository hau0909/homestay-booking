"use client";

export default function HostingBanner() {
  return (
    <section className="w-full py-16 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gray-200 px-16 py-20">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80"
              alt="Hosting Background"
              className="h-full w-full object-cover "
            />
          </div>

          {/* Background Text */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-5">
            <h1 className="text-[200px] font-bold leading-none text-white">
              BECOME
            </h1>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h2 className="mb-4 text-5xl font-bold text-white">Try Hosting</h2>
            <h2 className="mb-6 text-5xl font-bold text-white">With Us</h2>
            <p className="mb-8 text-lg text-white">
              Earn extra just by renting your property...
            </p>
            <button className="rounded-full bg-black hover:cursor-pointer px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-lg">
              Become A Host
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
