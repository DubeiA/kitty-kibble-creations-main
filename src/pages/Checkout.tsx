
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Cookies from 'js-cookie';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { getCartFromStorage, createOrder } from '@/utils/checkoutUtils';
import type { CheckoutFormValues } from '@/schemas/checkoutSchema';

const Checkout = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<Partial<CheckoutFormValues>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        // Fetch user profile data from database
        await fetchUserData(session.user.id);
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
          .eq('customer_id', userId)
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

  const createOrUpdateCustomer = async (formData: CheckoutFormValues, userId?: string) => {
    if (!userId) return null;
    
    try {
      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (existingCustomer) {
        // Update existing customer
        const { data, error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from('customers')
          .insert({
            id: userId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      return null;
    }
  };

  const handleSubmit = async (values: CheckoutFormValues) => {
    setOrderError(null);
    setIsProcessing(true);
    
    try {
      const cartItems = getCartFromStorage();
      
      if (cartItems.length === 0) {
        toast({
          title: "Помилка",
          description: "Ваш кошик порожній",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create or update customer if logged in
      const customerId = user ? user.id : undefined;
      if (customerId) {
        await createOrUpdateCustomer(values, customerId);
      }

      // Create order
      const orderDetails = await createOrder(values, cartItems, customerId);
      
      if (!orderDetails) {
        throw new Error("Не вдалося створити замовлення");
      }
      
      // If not logged in, save to localStorage
      if (!customerId) {
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(orderDetails);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
      }
      
      // Clear cart and form data
      localStorage.removeItem('cart');
      Cookies.remove('checkout-form');
      
      window.dispatchEvent(new Event('cartUpdated'));
      
      navigate('/payment-success');
    } catch (error) {
      console.error('Помилка оплати:', error);
      setOrderError("Сталася помилка при обробці замовлення");
      toast({
        title: "Помилка",
        description: "Сталася помилка при обробці замовлення",
        variant: "destructive",
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
          <h1 className="text-3xl font-display font-bold mb-8">Оформлення замовлення</h1>
          
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
