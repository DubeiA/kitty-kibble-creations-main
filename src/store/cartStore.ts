import { create } from 'zustand';
import { CartItem } from '@/types/cart';

const getCartFromStorage = (): CartItem[] => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
};

const getTotal = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

interface CartState {
  items: CartItem[];
  total: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, selectedWeight?: number) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    selectedWeight?: number
  ) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: getCartFromStorage(),
  total: getTotal(getCartFromStorage()),
  addToCart: item => {
    set(state => {
      const existingItem = state.items.find(
        i => i.id === item.id && i.selectedWeight === item.selectedWeight
      );

      let newItems;
      if (existingItem) {
        newItems = state.items.map(i =>
          i.id === item.id && i.selectedWeight === item.selectedWeight
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        newItems = [...state.items, item];
      }

      const newTotal = getTotal(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return { items: newItems, total: newTotal };
    });
  },
  removeFromCart: (id: string, selectedWeight?: number) => {
    set(state => {
      const newItems = state.items.filter(item =>
        selectedWeight
          ? !(item.id === id && item.selectedWeight === selectedWeight)
          : item.id !== id
      );
      const newTotal = getTotal(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return { items: newItems, total: newTotal };
    });
  },
  updateQuantity: (id: string, quantity: number, selectedWeight?: number) => {
    set(state => {
      const newItems = state.items.map(item =>
        selectedWeight
          ? item.id === id && item.selectedWeight === selectedWeight
            ? { ...item, quantity }
            : item
          : item.id === id
            ? { ...item, quantity }
            : item
      );
      const newTotal = getTotal(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return { items: newItems, total: newTotal };
    });
  },
  clearCart: () => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    set({ items: [], total: 0 });
  },
}));
