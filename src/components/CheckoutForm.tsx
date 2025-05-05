import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NovaPoshtaSelector } from '@/components/NovaPoshtaSelector';
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import { NovaPoshtaDelivery } from '@/types/order';
import { NovaPoshtaServices } from '@/services/novaPoshtaService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  warehouse: string;
  payerType: 'Sender' | 'Recipient';
  paymentMethod: 'Cash' | 'NonCash';
}

export const CheckoutForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      payerType: 'Recipient',
      paymentMethod: 'Cash',
    },
  });
  const [shippingMethod, setShippingMethod] = useState<
    'nova-poshta' | 'pickup'
  >('nova-poshta');
  const setShipping = useOrderStore(state => state.setShipping);
  const createWaybill = useOrderStore(state => state.createWaybill);
  const { items, total, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Спостерігаємо за значеннями payerType та paymentMethod
  const payerType = watch('payerType');
  const paymentMethod = watch('paymentMethod');

  const onSubmit = async (data: FormData) => {
    if (!data.payerType || !data.paymentMethod) {
      toast.error('Будь ласка, виберіть хто оплачує доставку та спосіб оплати');
      return;
    }

    setIsSubmitting(true);
    try {
      // Дані відправника (наш магазин)
      const senderData = {
        FirstName: 'Kitty Kibble',
        LastName: 'Creations',
        Phone: '+380123456789',
        City: '8d5a980d-391c-11dd-90d9-001a92567626', // Київ
        Warehouse: '1ec09d2e-e1c2-11e3-8c4a-0050568002cf', // Відділення в Києві
      };

      // Дані отримувача (клієнт)
      const recipientData = {
        FirstName: data.firstName,
        LastName: data.lastName,
        Phone: data.phone,
        City: data.city,
        Warehouse: data.warehouse,
      };

      // Дані вантажу
      const cargoData = {
        Description: items
          .map(item => `${item.name} x${item.quantity}`)
          .join(', '),
        Weight: items.reduce((acc, item) => acc + item.quantity, 0) * 0.5, // 0.5 кг на одиницю
        Cost: total,
      };

      console.log('Submitting form with data:', {
        senderData,
        recipientData,
        cargoData,
        payerType: data.payerType,
        paymentMethod: data.paymentMethod,
      });

      // Створюємо ТТН
      const waybillRef = await createWaybill(
        senderData,
        recipientData,
        cargoData,
        data.payerType,
        data.paymentMethod
      );

      toast.success('Замовлення успішно створено!');
      clearCart();
      navigate('/order-success', { state: { waybillRef } });
    } catch (error) {
      console.error('Nova Poshta error:', error);
      toast.error('Помилка при створенні замовлення. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNovaPoshtaSelect = async (city: string, warehouse: string) => {
    setValue('city', city);
    setValue('warehouse', warehouse);

    const weight = items.reduce((acc, item) => acc + item.quantity, 0) * 0.5;

    try {
      const shippingCost = await NovaPoshtaServices.calculateShippingCost(
        '8d5a980d-391c-11dd-90d9-001a92567626', // Київ
        city,
        weight,
        total
      );

      const shipping: NovaPoshtaDelivery = {
        city,
        warehouse,
        cost: shippingCost.Cost,
        estimatedDeliveryDate: shippingCost.EstimatedDeliveryDate,
      };

      setShipping(shipping);
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      const shipping: NovaPoshtaDelivery = {
        city,
        warehouse,
        cost: 0,
        estimatedDeliveryDate: '',
      };
      setShipping(shipping);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ім'я</Label>
          <Input
            id="firstName"
            {...register('firstName', { required: "Введіть ім'я" })}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Прізвище</Label>
          <Input
            id="lastName"
            {...register('lastName', { required: 'Введіть прізвище' })}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone', {
              required: 'Введіть телефон',
              pattern: {
                value: /^\+?[0-9]{10,12}$/,
                message: 'Введіть коректний номер телефону',
              },
            })}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', {
              required: 'Введіть email',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Введіть коректний email',
              },
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="nova-poshta"
              name="shipping"
              value="nova-poshta"
              checked={shippingMethod === 'nova-poshta'}
              onChange={() => setShippingMethod('nova-poshta')}
            />
            <Label htmlFor="nova-poshta">Нова Пошта</Label>

            <input
              type="radio"
              id="pickup"
              name="shipping"
              value="pickup"
              checked={shippingMethod === 'pickup'}
              onChange={() => setShippingMethod('pickup')}
            />
            <Label htmlFor="pickup">Самовивіз</Label>
          </div>

          {shippingMethod === 'nova-poshta' && (
            <>
              <NovaPoshtaSelector onSelect={handleNovaPoshtaSelect} />

              <div className="space-y-2">
                <Label htmlFor="payerType">Хто оплачує доставку</Label>
                <Select
                  value={payerType}
                  onValueChange={(value: 'Sender' | 'Recipient') =>
                    setValue('payerType', value)
                  }
                >
                  <SelectTrigger id="payerType">
                    <SelectValue placeholder="Виберіть хто оплачує" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sender">Відправник</SelectItem>
                    <SelectItem value="Recipient">Отримувач</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Спосіб оплати</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: 'Cash' | 'NonCash') =>
                    setValue('paymentMethod', value)
                  }
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Виберіть спосіб оплати" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Готівка</SelectItem>
                    <SelectItem value="NonCash">Безготівка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Обробка...' : 'Оформити замовлення'}
      </button>
    </form>
  );
};
