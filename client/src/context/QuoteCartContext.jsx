import React, { createContext, useContext, useState, useEffect } from 'react';

// A separate "quote list" for the Xelpov surgical-instrument catalogue, where
// products have no fixed price. Instead of buying items one at a time, a
// buyer collects several products here across different pages, then submits
// one combined request-for-quote to the sales team — this is the workflow
// hospitals/clinics actually use for bulk procurement.
const QuoteCartContext = createContext();

const STORAGE_KEY = 'medportal_quote_cart';

export function useQuoteCart() {
  return useContext(QuoteCartContext);
}

export function QuoteCartProvider({ children }) {
  const [quoteItems, setQuoteItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quoteItems));
    } catch {
      /* ignore storage errors (e.g. private browsing) */
    }
  }, [quoteItems]);

  /** product: { slug, name, image, mainCategory, specialty } */
  const addToQuote = (product) => {
    setQuoteItems((prev) => {
      const existing = prev.find((item) => item.slug === product.slug);
      if (existing) {
        return prev.map((item) =>
          item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsQuoteOpen(true);
  };

  const removeFromQuote = (slug) => {
    setQuoteItems((prev) => prev.filter((item) => item.slug !== slug));
  };

  const updateQuoteQuantity = (slug, quantity) => {
    if (quantity <= 0) {
      removeFromQuote(slug);
      return;
    }
    setQuoteItems((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, quantity } : item))
    );
  };

  const clearQuote = () => setQuoteItems([]);

  const isInQuote = (slug) => quoteItems.some((item) => item.slug === slug);

  const quoteCount = quoteItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <QuoteCartContext.Provider
      value={{
        quoteItems,
        isQuoteOpen,
        setIsQuoteOpen,
        addToQuote,
        removeFromQuote,
        updateQuoteQuantity,
        clearQuote,
        isInQuote,
        quoteCount,
      }}
    >
      {children}
    </QuoteCartContext.Provider>
  );
}
