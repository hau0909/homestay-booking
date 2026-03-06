"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';

interface WishlistItem {
    listing_id: number;
    created_at: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    refreshWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({ wishlist: [], refreshWishlist: () => { } });

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    const fetchWishlist = async () => {
        if (!user) {
            setWishlist([]);
            return;
        }

        const { data, error } = await supabase
            .from("wishlists")
            .select(`
      listing_id,
      created_at,
      listings (
        title,
        description,
        address_detail,
        listing_images (
          url,
          is_thumbnail
        )
      )
    `)
            .eq("user_id", user.id);

        if (error) {
            console.error(error);
            setWishlist([]);
            return;
        }

        console.log("wishlist data:", data);

        setWishlist(data || []);
    };

    useEffect(() => {
        fetchWishlist();
        // eslint-disable-next-line
    }, [user]);

    return (
        <WishlistContext.Provider value={{ wishlist, refreshWishlist: fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
