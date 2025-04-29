
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderStatus } from '@/types/checkout';
// import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { OrderList } from '@/components/admin/OrderList';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    

    // Subscribe to order changes
    const orderChanges = supabase
      .channel('public:orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          console.log('Order changes detected, refreshing orders list');
          fetchOrders();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(orderChanges);
    };
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
  if (!window.confirm("Ви впевнені, що хочете видалити це замовлення?")) return;
  // 1. Видалити order_items
await supabase
  .from('order_items')
  .delete()
  .eq('order_id', orderId);

// 2. Видалити замовлення
await supabase
  .from('orders')
  .delete()
  .eq('id', orderId);
fetchOrders(); // Оновити список після видалення
};

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, items:order_items(*, products:product_id(name))')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Process the data and ensure it conforms to the Order type
      const processedOrders: Order[] = ordersData?.map(order => ({
        ...order,
        // Explicitly cast string status to OrderStatus type
        status: order.status as OrderStatus,
        items: order.items?.map((item: any) => ({
          ...item,
          product_name: item.products?.name || 'Невідомий товар',
          total_price: item.quantity * item.price_at_time
        }))
      })) || [];

      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося завантажити замовлення",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('auth')
    localStorage.removeItem('cart');
    toast({
      title: "Вихід виконано",
      description: "Ви вийшли з панелі адміністратора",
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // First update the database
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      // Update the local state immediately for a responsive UI
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() } 
            : order
        )
      );
      
      toast({
        title: "Статус оновлено",
        description: `Замовлення оновлено до статусу "${getStatusLabel(newStatus)}"`,
      });
      
      // Re-fetch orders from database to ensure we have the latest data
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося оновити статус замовлення",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to get status labels for toast messages
  const getStatusLabel = (status: OrderStatus): string => {
    switch(status) {
      case 'pending': return 'Очікує обробки';
      case 'processing': return 'В обробці';
      case 'awaiting_shipment': return 'Очікує відправлення';
      case 'shipped': return 'Відправлено';
      case 'delivered': return 'Доставлено';
      case 'cancelled': return 'Скасовано';
      default: return 'Невідомо';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Панель адміністратора</CardTitle>
            <CardDescription>
              Керуйте замовленнями та перевіряйте їх статуси
            </CardDescription>
          </CardHeader>
          <CardContent>
             (
              <div className="space-y-6">
                <AdminHeader 
                  onRefresh={fetchOrders}
                  onLogout={handleLogout}
                />
              <OrderList 
                handleDeleteOrder={handleDeleteOrder}
                orders={orders}
                loading={loading}
                onUpdateStatus={updateOrderStatus}
                />
              </div>
            )
          </CardContent>
        </Card>
      </main>
      <NewsletterAndFooter />
    </div>
  );
};

export default Admin;
