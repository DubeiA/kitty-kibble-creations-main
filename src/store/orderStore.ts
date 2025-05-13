import { create } from 'zustand';
import { Order, NovaPoshtaDelivery } from '../types/order';
import { NovaPoshtaServices } from '../services/novaPoshtaService';

interface SenderData {
  FirstName: string;
  LastName: string;
  MiddleName?: string;
  Phone: string;
  City: string;
  Warehouse: string;
}

interface RecipientData {
  FirstName: string;
  LastName: string;
  MiddleName?: string;
  Phone: string;
  City: string;
  Warehouse: string;
}

interface OrderState {
  order: Order | null;
  shipping: NovaPoshtaDelivery | null;
  loading: boolean;
  error: string | null;
  setShipping: (shipping: NovaPoshtaDelivery) => void;
  calculateShippingCost: (
    citySender: string,
    cityRecipient: string,
    weight: number,
    cost: number
  ) => Promise<void>;
  createWaybill: (
    senderData: SenderData,
    recipientData: RecipientData,
    cargoData: {
      Description: string;
      Weight: number;
      Cost: number;
    },
    payerType: 'Sender' | 'Recipient',
    paymentMethod: 'Cash' | 'NonCash'
  ) => Promise<string>;
  trackWaybill: (waybillNumber: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>(set => ({
  order: null,
  shipping: null,
  loading: false,
  error: null,

  setShipping: shipping => set({ shipping }),

  calculateShippingCost: async (citySender, cityRecipient, weight, cost) => {
    set({ loading: true, error: null });
    try {
      const shippingCost = await NovaPoshtaServices.calculateShippingCost(
        citySender,
        cityRecipient,
        weight,
        cost
      );
      set({
        shipping: {
          city: cityRecipient,
          warehouse: '',
          cost: shippingCost.Cost,
          estimatedDeliveryDate: shippingCost.EstimatedDeliveryDate,
        },
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Помилка при розрахунку вартості доставки',
        loading: false,
      });
    }
  },

  createWaybill: async (
    senderData,
    recipientData,
    cargoData,
    payerType,
    paymentMethod
  ) => {
    set({ loading: true, error: null });
    try {
      const senderPayload = {
        CitySender: senderData.City,
        SenderAddress: senderData.Warehouse,
        Sender: '',
        ContactSender: '',
        SendersPhone: senderData.Phone,
      };
      const recipientPayload = {
        CityRecipient: recipientData.City,
        RecipientAddress: recipientData.Warehouse,
        ContactRecipient: '',
        RecipientsPhone: recipientData.Phone,
        Recipient: '',
        FirstName: recipientData.FirstName,
        LastName: recipientData.LastName,
        MiddleName: recipientData.MiddleName,
      };
      const waybillRef = await NovaPoshtaServices.createWaybill(
        senderPayload,
        recipientPayload,
        {
          ...cargoData,
          ServiceType: 'WarehouseWarehouse',
          SeatsAmount: 1,
        },
        payerType,
        paymentMethod
      );

      set(state => ({
        order: state.order
          ? {
              ...state.order,
              waybillRef,
              status: 'processing',
              createdAt: new Date().toISOString(),
            }
          : null,
        shipping: state.shipping
          ? {
              ...state.shipping,
              waybillRef,
              status: 'processing',
            }
          : null,
        loading: false,
      }));

      return waybillRef;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Помилка при створенні накладної',
        loading: false,
      });
      throw error;
    }
  },

  trackWaybill: async waybillNumber => {
    set({ loading: true, error: null });
    try {
      const trackingInfo = await NovaPoshtaServices.trackWaybill(waybillNumber);
      set(state => ({
        shipping: state.shipping
          ? {
              ...state.shipping,
              trackingStatus: trackingInfo.Status,
              warehouseSender: trackingInfo.WarehouseSender,
              warehouseRecipient: trackingInfo.WarehouseRecipient,
              scheduledDeliveryDate: trackingInfo.ScheduledDeliveryDate,
            }
          : null,
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Помилка при відстеженні відправлення',
        loading: false,
      });
    }
  },
}));
