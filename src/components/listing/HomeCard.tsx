import { Listing } from "@/src/types/listing";
import { useEffect, useState } from "react";
import { getHomeByListingId } from "@/src/services/home/getHomeByListingId";
import { useRouter } from "next/navigation";

interface Props {
  listing: Listing;
  index: number;
  image?: string;
}

export default function HomeCard({ listing, index, image }: Props) {
  const [price, setPrice] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPrice() {
      const home = await getHomeByListingId(listing.id.toString());
      setPrice(home?.price_weekday ?? null);
    }
    fetchPrice();
  }, [listing.id]);

  const formattedDate = new Date(listing.created_at).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div
      onClick={() => router.push(`/hosting/listing/edit/${listing.id}`)}
      className={`grid grid-cols-[50px_110px_1.6fr_1.3fr_130px_150px_120px] items-center px-8 py-5 border-b bg-white hover:bg-gray-50 hover:shadow-sm transition-all duration-200 cursor-pointer`}
    >
      <div className="text-sm text-gray-400">{index + 1}</div>
      <div>
        {image ? (
          <img
            src={image}
            className="w-24 h-16 object-cover rounded-xl shadow-sm"
            alt={listing.title}
          />
        ) : (
          <div className="w-24 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="font-semibold text-gray-900 truncate">{listing.title}</div>
      <div className="text-sm text-gray-500 truncate">{listing.address_detail || "-"}</div>
      <div className="text-sm font-semibold text-gray-900 truncate">
        {price !== null && price !== undefined
          ? price.toLocaleString("en-US", { style: "currency", currency: "USD" })
          : "-"}
      </div>
      <div className="text-sm text-gray-500">{formattedDate}</div>
      <div>
        <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
          {listing.status}
        </span>
      </div>
    </div>
  );
}
