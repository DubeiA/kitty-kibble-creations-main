import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
// import { createOrder } from '@/utils/checkoutUtils';
import type { CheckoutFormValues } from '@/schemas/checkoutSchema';
import { useCartStore } from '@/store/cartStore';

const Checkout = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<Partial<CheckoutFormValues>>({});
  const { toast } = useToast();
  const { items } = useCartStore();

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser?.email) {
        // гість або тимчасовий користувач
        await supabase.auth.signOut(); // викидай тільки їх
        localStorage.removeItem('cart');
      } else {
        setUser(currentUser); // зберігай реального користувача
        await fetchUserData(currentUser.id);
      }
    };

    checkSession();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // First try to get customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single();

      if (customerData) {
        setUserData({
          name: customerData.name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
        });

        // Try to get the latest order to pre-fill shipping info
        const { data: latestOrder, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (latestOrder && !orderError) {
          setUserData(prev => ({
            ...prev,
            address: latestOrder.shipping_address || '',
            city: latestOrder.shipping_city || '',
          }));
        }
      } else if (customerError && user) {
        // If no customer record exists but user is authenticated
        setUserData({
          email: user.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSubmit = async (values: CheckoutFormValues) => {
    setOrderError(null);
    setIsProcessing(true);

    try {
      const cartItems = items;

      if (cartItems.length === 0) {
        toast({
          title: 'Помилка',
          description: 'Ваш кошик порожній',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Clear cart and form data
      localStorage.removeItem('cart');
      Cookies.remove('checkout-form');

      window.dispatchEvent(new Event('cartUpdated'));

      navigate('/payment-success');
    } catch (error) {
      console.error('Помилка оплати:', error);
      setOrderError('Сталася помилка при обробці замовлення');
      toast({
        title: 'Помилка',
        description: 'Сталася помилка при обробці замовлення',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-display font-bold mb-8">
            Оформлення замовлення
          </h1>

          {orderError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{orderError}</AlertDescription>
            </Alert>
          )}
          <CheckoutForm
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            defaultValues={userData}
          />
        </div>
      </main>
      <NewsletterAndFooter />
    </div>
  );
};

export default Checkout;
