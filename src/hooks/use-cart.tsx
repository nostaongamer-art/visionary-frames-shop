import { createContext, useContext, useState, type ReactNode } from "react";

type CartContextValue = {
  count: number;
  addItem: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(3);
  const addItem = () => setCount((c) => c + 1);
  return <CartContext.Provider value={{ count, addItem }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
