
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart from localStorage
    localStorage.removeItem('cart');
    // Dispatch event to update cart counter in header
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 text-green-500">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">
            Дякуємо за замовлення!
          </h1>
          <p className="text-neutral-600 mb-8">
            Ми надішлемо вам email з підтвердженням замовлення та деталями доставки.
          </p>
          <Button onClick={() => navigate('/shop')} className="w-full">
            Повернутися до магазину
          </Button>
        </div>
      </main>
      <NewsletterAndFooter />
    </div>
  );
};

export default PaymentSuccess;
