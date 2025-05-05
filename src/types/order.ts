export interface NovaPoshtaDelivery {
  city: string;
  warehouse: string;
  cost: number;
  estimatedDeliveryDate: string;
  waybillNumber?: string;
  trackingStatus?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  shipping: NovaPoshtaDelivery;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface NovaPoshtaResponse {
  success: boolean;
  data: any[];
  errors: string[];
  warnings: string[];
  info: {
    totalCount: number;
  };
}

export interface NovaPoshtaCity {
  Description: string;
  Ref: string;
  AreaDescription: string;
}

export interface NovaPoshtaWarehouse {
  Description: string;
  Ref: string;
  Number: string;
  CityRef: string;
}

export interface NovaPoshtaShippingCost {
  Cost: number;
  EstimatedDeliveryDate: string;
}

export interface NovaPoshtaTrackingInfo {
  Status: string;
  WarehouseSender: string;
  WarehouseRecipient: string;
  ScheduledDeliveryDate: string;
}
