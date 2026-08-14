import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string | number;
  name: string;
  price: string;
  priceVal: number;
  imageUrl?: string;
  imageKey?: string;
  category?: string;
  discount?: string;
  oldPrice?: string;
  quantity: number;
  stock?: number;
}

type CartContextValue = {
  count: number;
  items: CartItem[];
  addItem: (product?: any, qty?: number) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("glasses_cart_items");
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to parse cart items:", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("glasses_cart_items", JSON.stringify(items));
    }
  }, [items]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (product?: any, qty = 1) => {
    // Backwards-compatibility check
    if (!product || typeof product === "number") {
      const q = typeof product === "number" ? product : qty;
      // Add default mock product
      setItems((prev) => {
        const existing = prev.find((item) => item.id === 1);
        if (existing) {
          return prev.map((item) =>
            item.id === 1 ? { ...item, quantity: item.quantity + q } : item
          );
        }
        return [
          ...prev,
          {
            id: 1,
            name: "Armação Classic Black",
            price: "R$ 199,90",
            priceVal: 199.90,
            imageKey: "prod1",
            quantity: q,
          },
        ];
      });
      return;
    }

    setItems((prev) => {
      const existing = prev.find((item) => String(item.id) === String(product.id));
      const parsedPriceVal = typeof product.priceVal === "number" ? product.priceVal : parseFloat(String(product.price).replace(/[^\d.,]/g, "").replace(",", ".")) || 199.90;
      const productStock = product.stock !== undefined ? parseInt(String(product.stock)) : undefined;

      if (existing) {
        const newQty = existing.quantity + qty;
        if (existing.stock !== undefined && !isNaN(existing.stock) && newQty > existing.stock) {
          toast.error(`Desculpe, temos apenas ${existing.stock} unidade(s) deste modelo em estoque.`);
          return prev;
        }
        return prev.map((item) =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: newQty }
            : item
        );
      }

      if (productStock !== undefined && !isNaN(productStock) && qty > productStock) {
        toast.error(`Desculpe, temos apenas ${productStock} unidade(s) deste modelo em estoque.`);
        return prev;
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          priceVal: parsedPriceVal,
          imageUrl: product.imageUrl,
          imageKey: product.imageKey,
          category: product.category,
          discount: product.discount,
          oldPrice: product.oldPrice,
          quantity: qty,
          stock: productStock,
        },
      ];
    });
  };

  const removeItem = (id: string | number) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const updateQuantity = (id: string | number, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => {
      const existing = prev.find((item) => String(item.id) === String(id));
      if (existing && existing.stock !== undefined && !isNaN(existing.stock) && qty > existing.stock) {
        toast.error(`Desculpe, temos apenas ${existing.stock} unidade(s) deste modelo em estoque.`);
        return prev;
      }
      return prev.map((item) => (String(item.id) === String(id) ? { ...item, quantity: qty } : item));
    });
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        count,
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
