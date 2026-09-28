import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();
const STORAGE_KEY = 'medportal_wishlist';

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore storage errors */ }
  }, [items]);

  const isSaved = (slug) => items.some((item) => item.slug === slug);

  const toggleWishlist = (product) => {
    setItems((prev) => {
      if (prev.some((item) => item.slug === product.slug)) {
        return prev.filter((item) => item.slug !== product.slug);
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (slug) => setItems((prev) => prev.filter((item) => item.slug !== slug));
  const clearWishlist = () => setItems([]);
  const wishlistCount = items.length;

  return (
    <WishlistContext.Provider value={{
      items, isWishlistOpen, setIsWishlistOpen, isSaved, toggleWishlist, removeFromWishlist, clearWishlist, wishlistCount,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}
