import { CartItem, Order, OrderStatus } from '../types/checkout';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { NovaPoshtaServices } from '@/services/novaPoshtaService';

export const calculateTotal = (cartItems: CartItem[]): number => {
  return Number(
    cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2)
  );
};

export const createOrder = async (
  customerData: any,
  cartItems: CartItem[],
  customerId?: string
): Promise<Order | null> => {
  let {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    localStorage.removeItem('cart');

    await supabase.auth.signInAnonymously();
    ({
      data: { user },
    } = await supabase.auth.getUser());
  }

  try {
    // --- Формування user_id для авторизованого і гостя ---
    const userId = user.id;

    // Отримуємо назву міста та відділення з Nova Poshta API

    const cityResponse = await NovaPoshtaServices.getCityByRef(
      customerData.city
    );

    const warehouseResponse = await NovaPoshtaServices.getWarehouseByRef(
      customerData.warehouse
    );

    if (!cityResponse || !warehouseResponse) {
      throw new Error('Failed to get city or warehouse data');
    }

    // Якщо не вдалося отримати дані через API, використовуємо значення з форми
    const orderData = {
      id: uuidv4(),
      user_id: userId,
      total_amount: calculateTotal(cartItems),
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      shipping_address: warehouseResponse.Description,
      shipping_city: cityResponse.Description,
      status: 'pending' as OrderStatus,
      waybill_number: customerData.waybill_number,
      created_at: new Date().toISOString(),
    };

    // Зберігаємо замовлення в базі даних

    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    const orderItems = cartItems.map(item => ({
      order_id: orderResult.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: Number(item.price.toFixed(2)),
    }));

    // Create order items in the database
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw new Error('Failed to create order items');
    }

    const order: Order = {
      ...orderData,
      items: cartItems.map(item => ({
        id: uuidv4(),
        order_id: orderResult.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_time: Number(item.price.toFixed(2)),
        total_price: Number((item.price * item.quantity).toFixed(2)),
        image_url: item.image_url,
      })),
    };

    return order;
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
