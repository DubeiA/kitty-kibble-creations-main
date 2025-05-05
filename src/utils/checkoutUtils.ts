import { CartItem, Order, OrderStatus } from '../types/checkout';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/store/cartStore';

export const calculateTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

export const createOrder = async (
  customerData: any,
  cartItems: CartItem[],
  customerId?: string
): Promise<Order | null> => {
  try {
    // --- Формування user_id для авторизованого і гостя ---
    let userId = customerId;
    if (!userId) {
      userId = localStorage.getItem('guest_user_id');
      if (!userId) {
        userId = uuidv4();
        localStorage.setItem('guest_user_id', userId);
      }
    }
    const orderData = {
      id: uuidv4(),
      user_id: userId,
      total_amount: calculateTotal(cartItems),
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      shipping_address: customerData.address,
      shipping_city: customerData.city,
      created_at: new Date().toISOString(),
      status: 'pending' as OrderStatus,
    };

    if (customerId) {
      // Create new order in the database
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
      }

      const orderItems = cartItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
      }));

      // Create order items in the database
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }

      const order: Order = {
        ...orderData,
        items: cartItems.map(item => ({
          id: uuidv4(),
          order_id: orderResult.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_at_time: item.price,
          total_price: item.price * item.quantity,
          image_url: item.image_url,
        })),
      };

      return order;
    } else {
      // For guest checkout, store the order locally
      const order: Order = {
        ...orderData,
        items: cartItems.map(item => ({
          id: uuidv4(),
          order_id: orderData.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price_at_time: item.price,
          total_price: item.price * item.quantity,
          image_url: item.image_url,
        })),
      };

      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      return order;
    }
  } catch (error) {
    console.error('Error in createOrder:', error);
    return null;
  }
};

export const getStatusDisplay = (
  status: OrderStatus
): { label: string; color: string } => {
  switch (status) {
    case 'pending':
      return { label: 'Очікує обробки', color: 'yellow' };
    case 'processing':
      return { label: 'В обробці', color: 'blue' };
    case 'awaiting_shipment':
      return { label: 'Очікує відправлення', color: 'orange' };
    case 'shipped':
      return { label: 'Відправлено', color: 'purple' };
    case 'delivered':
      return { label: 'Доставлено', color: 'green' };
    case 'cancelled':
      return { label: 'Скасовано', color: 'red' };
    default:
      return { label: 'Невідомо', color: 'gray' };
  }
};

export const getOrderStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':
      return { icon: 'CheckCircle', className: 'h-5 w-5 text-green-500' };
    case 'shipped':
      return { icon: 'Truck', className: 'h-5 w-5 text-purple-500' };
    case 'processing':
      return { icon: 'Package', className: 'h-5 w-5 text-blue-500' };
    case 'awaiting_shipment':
      return { icon: 'PackageCheck', className: 'h-5 w-5 text-orange-500' };
    case 'cancelled':
      return { icon: 'XCircle', className: 'h-5 w-5 text-red-500' };
    default:
      return { icon: 'Clock', className: 'h-5 w-5 text-yellow-500' };
  }
};
