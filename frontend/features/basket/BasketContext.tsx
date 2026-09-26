"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface BasketItem {
  raffleId: string;
  title: string;
  slug: string;
  image: string;
  ticketPrice: number;
  quantity: number;
  totalTickets: number;
  ticketsSold: number;
  minTickets: number;
  maxTickets: number | null;
  endDate?: string;
  category?: string;
}

interface BasketContextType {
  items: BasketItem[];
  addItem: (item: Omit<BasketItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (raffleId: string, quantity: number) => void;
  removeItem: (raffleId: string) => void;
  clearBasket: () => void;
  totalTicketsCount: number;
  totalItemsCount: number;
  totalAmount: number;
  isBasketOpen: boolean;
  openBasket: () => void;
  closeBasket: () => void;
  toggleBasket: () => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

const BASKET_STORAGE_KEY = "charity_draws_basket_v1";

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isBasketOpen, setIsBasketOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load basket from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BASKET_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to parse basket from localStorage:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save basket to localStorage on state change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save basket to localStorage:", err);
    }
  }, [items, isHydrated]);

  const addItem = (newItem: Omit<BasketItem, "quantity"> & { quantity?: number }) => {
    const qtyToAdd = newItem.quantity ?? (newItem.minTickets || 1);
    const min = newItem.minTickets || 1;
    const max = newItem.maxTickets ?? null;
    const remaining = Math.max(0, newItem.totalTickets - newItem.ticketsSold);

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.raffleId === newItem.raffleId);

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        let newQty = existing.quantity + qtyToAdd;

        if (max !== null && newQty > max) {
          toast.error(`Maximum ticket limit for this draw is ${max}.`);
          newQty = max;
        }

        if (newQty > remaining) {
          toast.error(`Only ${remaining} tickets left available.`);
          newQty = remaining;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          // Update latest prices / metadata
          ticketPrice: newItem.ticketPrice,
          totalTickets: newItem.totalTickets,
          ticketsSold: newItem.ticketsSold,
        };
        toast.success(`Updated basket: ${newQty} tickets for "${newItem.title}"`);
        return updated;
      } else {
        let finalQty = qtyToAdd;
        if (finalQty < min) finalQty = min;
        if (max !== null && finalQty > max) finalQty = max;
        if (finalQty > remaining) finalQty = remaining;

        toast.success(`Added ${finalQty} ticket(s) to your basket!`);
        return [
          ...prev,
          {
            ...newItem,
            quantity: finalQty,
          },
        ];
      }
    });

    setIsBasketOpen(true);
  };

  const updateQuantity = (raffleId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.raffleId !== raffleId) return item;

          const min = item.minTickets || 1;
          const max = item.maxTickets ?? null;
          const remaining = Math.max(0, item.totalTickets - item.ticketsSold);

          let target = quantity;
          if (target < min) target = min;
          if (max !== null && target > max) target = max;
          if (target > remaining) target = remaining;

          return { ...item, quantity: target };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (raffleId: string) => {
    setItems((prev) => {
      const removed = prev.find((i) => i.raffleId === raffleId);
      if (removed) {
        toast.info(`Removed "${removed.title}" from your basket.`);
      }
      return prev.filter((i) => i.raffleId !== raffleId);
    });
  };

  const clearBasket = () => {
    setItems([]);
  };

  const totalTicketsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsCount = items.length;
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * Number(item.ticketPrice || 0),
    0
  );

  const openBasket = () => setIsBasketOpen(true);
  const closeBasket = () => setIsBasketOpen(false);
  const toggleBasket = () => setIsBasketOpen((prev) => !prev);

  return (
    <BasketContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearBasket,
        totalTicketsCount,
        totalItemsCount,
        totalAmount,
        isBasketOpen,
        openBasket,
        closeBasket,
        toggleBasket,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}
