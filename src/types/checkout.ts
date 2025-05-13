export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  selectedWeight: number;
};

export type CheckoutFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'awaiting_shipment'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type Order = {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_time: number;
  total_price: number;
  image_url?: string;
  selected_weight: number;
};

export type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};
