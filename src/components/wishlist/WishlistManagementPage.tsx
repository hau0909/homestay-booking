// trietcmce180982_sprint3
import React from 'react';
import ToggleWishlistAction from './ToggleWishlistAction';
import { useWishlist } from '@/src/context/WishlistContext';

interface ListingImage {
  url: string;
  is_thumbnail?: boolean;
}

interface Listing {
  title?: string;
  description?: string;
  address_detail?: string;
  listing_images?: ListingImage[];
}

interface WishlistItem {
  listing_id: number;
  created_at: string;
  listings?: Listing;
}

export default function WishlistManagementPage() {
  const { wishlist, refreshWishlist } = useWishlist();

  return (
    <div className="wishlist-page">
      <h2>My Wishlist</h2>
      <button onClick={refreshWishlist} style={{ marginBottom: 16 }}>
        Refresh
      </button>
      <ul>
        {wishlist.length === 0 ? (
          <li>No wishlist items found.</li>
        ) : (
          wishlist.map((item: WishlistItem) => {
            const listing = item.listings;
            const thumbnail = listing?.listing_images?.find((img: ListingImage) => img.is_thumbnail)?.url
              || listing?.listing_images?.[0]?.url;
            return (
              <li key={item.listing_id} style={{ marginBottom: 24 }}>
                {/* Hiển thị tất cả ảnh của listing */}
                {listing && Array.isArray(listing.listing_images) && listing.listing_images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {listing.listing_images.map((img: ListingImage, idx: number) => (
                      <img key={idx} src={img.url} alt={listing?.title} width={120} style={{ borderRadius: 8 }} />
                    ))}
                  </div>
                )}
                <div>
                  <h3>{listing?.title || 'No title'}</h3>
                  <p>{listing?.description || ''}</p>
                  <p>{listing?.address_detail || ''}</p>
                  <p>Added at: {item.created_at}</p>
                  <ToggleWishlistAction listingId={item.listing_id} onRemoved={refreshWishlist} />
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
