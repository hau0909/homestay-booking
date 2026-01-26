export default function HostListingsPage() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#328E6E]">My Listings</h1>
        <a
          href="/host/listings/create"
          className="bg-[#328E6E] text-white px-4 py-2 rounded-lg"
        >
          Create New Listing
        </a>
      </div>
      {/* List of user's listings */}
    </div>
  );
}
