import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types';

const CART_KEY = 'fargo-cart';

export interface CartItem {
  product: Product;
  quantity: number;
}

export function readCart(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore storage write failures (private mode / quota)
  }
}

/**
 * Shared shopping-bag state, persisted to localStorage.
 * All usage sites (product grid, product detail, checkout) read from the same source.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    persist(items);
  }, [items]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.product.price) || 0) * item.quantity, 0),
    [items],
  );

  const add = useCallback((product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }
      return [...current, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, change: number) => {
    setItems((current) =>
      current
        .map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity + change } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, count, subtotal, add, updateQuantity, remove, clear };
}
