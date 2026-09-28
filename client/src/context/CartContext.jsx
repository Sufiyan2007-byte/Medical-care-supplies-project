import React, { createContext, useContext, useState, useEffect } from 'react';
import { priceOf } from '../utils/pricing';

const CartContext = createContext();

export const VAT_RATE = 0.15;

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('medportal_cart');
      // drop any old placeholder prices saved by earlier versions of the site
      return stored ? JSON.parse(stored).map((i) => ({ ...i, price: priceOf(i.price) })) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('medportal_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    // Respect an explicit quantity (e.g. from the product detail page's quantity
    // stepper, or a batched reorder) instead of always adding just one unit.
    const qty = Math.max(1, Math.floor(Number(product.quantity)) || 1);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, price: priceOf(product.price), quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  /** Subtotal — real item.price only; items with no price contribute 0 */
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * item.quantity;
  }, 0);

  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;

  /** Keep cartTotal as alias so existing consumers still work */
  const cartTotal = grandTotal;

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        vat,
        grandTotal,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


