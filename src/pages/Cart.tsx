import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import { Button } from '../components/ui/button';
import { PawPrint, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import LoadingPaws from '../components/LoadingPaws';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

// Get cart from localStorage
const getCartFromStorage = () => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  // Dispatch custom event for cart updates
  window.dispatchEvent(new Event('cartUpdated'));
};

const Cart = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>(getCartFromStorage());
  const navigate = useNavigate();
  const { toast } = useToast();

  // Save cart items to localStorage when they change
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const removeFromCart = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return <LoadingPaws />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Кошик</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-display mb-4">Ваш кошик порожній</h2>
            <Button onClick={() => navigate('/shop')} className="btn-primary">
              Продовжити покупки
              <PawPrint size={18} />
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-grow">
                    <h3 className="font-display font-semibold">{item.name}</h3>
                    <p className="text-neutral-600">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
              <h3 className="font-display font-semibold mb-4">Разом до сплати</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Сума</span>
                  <span>{total.toFixed(2)} ₴</span>
                </div>
                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>Безкоштовно</span>
                </div>
                <div className="border-t pt-2 font-semibold flex justify-between">
                  <span>Всього</span>
                  <span>{total.toFixed(2)} ₴</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/checkout')} 
                className="w-full btn-primary"
              >
                Оформити замовлення
                <PawPrint size={18} />
              </Button>
            </div>
          </div>
        )}
      </main>
      <NewsletterAndFooter />
    </div>
  );
};

export default Cart;
