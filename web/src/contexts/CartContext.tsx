import { Product } from "@/lib/api";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity?: number,
    size?: string,
    color?: string,
  ) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "elegance_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (
    product: Product,
    quantity = 1,
    size?: string,
    color?: string,
  ) => {
    let success = true;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color === color,
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQuantity = updated[existingIndex].quantity + quantity;

        if (newQuantity > product.stock) {
          toast.error(
            `Cannot add more items. Only ${product.stock} available in stock.`,
          );
          success = false;
          return prev;
        }

        updated[existingIndex].quantity = newQuantity;
        return updated;
      }

      if (quantity > product.stock) {
        toast.error(`Only ${product.stock} items available in stock.`);
        success = false;
        return prev;
      }

      return [...prev, { product, quantity, size, color }];
    });

    if (success) {
      toast.success(`${product.name} added to cart.`);
    }
  };

  const removeItem = (productId: string, size?: string, color?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.size === size &&
            item.color === color
          ),
      ),
    );
    toast.info("Item removed from cart.");
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    size?: string,
    color?: string,
  ) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }

    // Find the specific item to validate stock rules
    const targetItem = items.find(
      (item) =>
        item.product.id === productId &&
        item.size === size &&
        item.color === color,
    );

    if (targetItem && targetItem.product.stock < quantity) {
      toast.error(`Only ${targetItem.product.stock} items available in stock.`);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        item.size === size &&
        item.color === color
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.info("Cart cleared.");
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
