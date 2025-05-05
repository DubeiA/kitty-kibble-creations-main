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
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: getCartFromStorage(),
  total: getTotal(getCartFromStorage()),
  addToCart: item => {
    set(state => {
      const existingItem = state.items.find(i => i.id === item.id);
      let newItems;
      if (existingItem) {
        newItems = state.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }
      const newTotal = getTotal(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return { items: newItems, total: newTotal };
    });
  },
  removeFromCart: id => {
    set(state => {
      const item = state.items.find(i => i.id === id);
      if (!item) return state;
      const newItems = state.items.filter(i => i.id !== id);
      const newTotal = getTotal(newItems);
      localStorage.setItem('cart', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cartUpdated'));
      return { items: newItems, total: newTotal };
    });
  },
  updateQuantity: (id, quantity) => {
    set(state => {
      const item = state.items.find(i => i.id === id);
      if (!item) return state;
      const newItems = state.items.map(i =>
        i.id === id ? { ...i, quantity } : i
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
