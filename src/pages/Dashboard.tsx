import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Order } from '@/types/checkout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import OrderCard from '@/components/dashboard/OrderCard';
import UserProfile from '@/components/dashboard/UserProfile';
import { OrderStatus } from '@/types/checkout';

const Dashboard = () => {
  const PAGE_SIZE = 5;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      if (user) {
        fetchOrders(user.id, page);
      }
    };

    checkSession();

    // Set up real-time subscription to order updates
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`,
        },
        payload => {
          // When an order is updated, refresh the orders
          if (user?.id) {
            fetchOrders(user.id);
          }
        }
      )
      .subscribe();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [navigate, user?.id, page]);

  const fetchOrders = async (userId: string, pageNumber = 0) => {
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          items:order_items(*, products:product_id(name, image_url))
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      if (data) {
        const typedOrders: Order[] = data.map(order => ({
          id: order.id,
          user_id: order.user_id,
          customer_name: order.customer_name || '',
          customer_email: order.customer_email || '',
          customer_phone: order.customer_phone || '',
          shipping_address: order.shipping_address || '',
          shipping_city: order.shipping_city || '',
          total_amount: order.total_amount,
          status: order.status as OrderStatus,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: order.items
            ? order.items.map(item => ({
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id,
                product_name: item.products?.name || 'Невідомий товар',
                quantity: item.quantity,
                price_at_time: item.price_at_time,
                total_price: item.price_at_time * item.quantity,
                image_url: item.products?.image_url || '',
              }))
            : [],
        }));

        setOrders(typedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити замовлення',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('cart'); // Очищення кошика
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-display">
                  Особистий кабінет
                </CardTitle>
                <CardDescription>
                  Керуйте замовленнями та налаштуваннями аккаунту
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Вийти
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders">
              <TabsList className="grid grid-cols-2 mb-8">
                <TabsTrigger value="orders">Мої замовлення</TabsTrigger>
                <TabsTrigger value="profile">Профіль</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                <h2 className="text-lg font-medium">Історія замовлень</h2>

                {loading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2">Завантаження замовлень...</p>
                  </div>
                ) : (
                  <>
                    {orders.length > 0 ? (
                      <div className="space-y-6">
                        {orders.map(order => (
                          <OrderCard key={order.id} order={order} />
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center border rounded-lg">
                        <p className="text-muted-foreground">
                          У вас поки немає замовлень
                        </p>
                        <Button
                          className="mt-4"
                          onClick={() => navigate('/shop')}
                        >
                          Перейти до магазину
                        </Button>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Попередня
                  </Button>
                  <span className="text-sm">Сторінка {page + 1}</span>
                  <Button
                    onClick={() => setPage(p => p + 1)}
                    disabled={orders.length < PAGE_SIZE}
                  >
                    Наступна
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="profile">
                <UserProfile user={user} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <NewsletterAndFooter />
    </div>
  );
};

export default Dashboard;
