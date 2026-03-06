"use client";
// trietcmce180982_sprint3
import React, { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import { useWishlist } from '@/src/context/WishlistContext';

interface ToggleWishlistActionProps {
  listingId: number;
  onRemoved?: () => void;
}


export default function ToggleWishlistAction({ listingId, onRemoved }: ToggleWishlistActionProps) {
  const { user } = useAuth();
  const { refreshWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);
    setLoading(false);
    refreshWishlist();
    if (onRemoved) onRemoved(); // Gọi refresh sau khi xóa
  };

  return (
    <button
      style={{
        background: '#ff5a5f',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '8px 16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
      onClick={handleRemove}
      disabled={loading}
    >
      Remove from Wishlist
    </button>
  );
}
