import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NovaPoshtaSelector } from '@/components/NovaPoshtaSelector';
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import { NovaPoshtaServices } from '@/services/novaPoshtaService';
import { formatPrice } from '@/lib/utils';
import { PawPrint, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { createOrder } from '@/utils/checkoutUtils';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Ім'я має бути не менше 2 символів",
  }),
  lastName: z.string().min(2, {
    message: 'Прізвище має бути не менше 2 символів',
  }),
  middleName: z.string().min(2, {
    message: 'По батькові має бути не менше 2 символів',
  }),
  phone: z.string().min(10, {
    message: 'Введіть коректний номер телефону',
  }),
  email: z.string().email({
    message: 'Введіть коректний email',
  }),
  city: z.string(),
  warehouse: z.string(),
  payerType: z.enum(['Sender', 'Recipient']),
  paymentMethod: z.enum(['Cash', 'NonCash']),
});

interface CheckoutFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isProcessing?: boolean;
  defaultValues?: Partial<z.infer<typeof formSchema>>;
}

export function CheckoutForm({
  onSubmit,
  isProcessing = false,
  defaultValues,
}: CheckoutFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payerType: 'Recipient',
      paymentMethod: 'Cash',
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      email: '',
      city: '',
      warehouse: '',
      ...defaultValues,
    },
  });

  const setShipping = useOrderStore(state => state.setShipping);
  const { items, total, removeFromCart, updateQuantity, clearCart } =
    useCartStore();
  const shipping = useOrderStore(state => state.shipping);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    getUser();
  }, []);

  const handleNovaPoshtaSelect = async (city: string, warehouse: string) => {
    form.setValue('city', city);
    form.setValue('warehouse', warehouse);
    const weight = items.reduce((acc, item) => acc + item.quantity, 0) * 0.5;
    try {
      const shippingCost = await NovaPoshtaServices.calculateShippingCost(
        '8d5a980d-391c-11dd-90d9-001a92567626',
        city,
        weight,
        total
      );
      const shipping = {
        city,
        warehouse,
        cost: shippingCost.Cost,
        estimatedDeliveryDate: shippingCost.EstimatedDeliveryDate,
      };
      setShipping(shipping);
    } catch (error) {
      setShipping({ city, warehouse, cost: 0, estimatedDeliveryDate: '' });
    }
  };

  const handleRemoveFromCart = (id: string) => {
    removeFromCart(id);
    toast({
      title: 'Товар видалено',
      description: 'Товар було видалено з кошика',
    });
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // 1. Отримуємо відправника (Sender)
      const senderResponse =
        await NovaPoshtaServices.getCounterparties('Sender');
      if (
        !senderResponse.success ||
        !senderResponse.data ||
        senderResponse.data.length === 0
      ) {
        throw new Error('Не знайдено відправника');
      }
      const senderRef = senderResponse.data[0].Ref;

      // 2. Отримуємо контактну особу відправника
      const contactSenderResponse =
        await NovaPoshtaServices.getCounterpartyContactPersons(senderRef);
      if (
        !contactSenderResponse.success ||
        !contactSenderResponse.data ||
        contactSenderResponse.data.length === 0
      ) {
        throw new Error('Не знайдено контактну особу відправника');
      }
      const contactSenderRef = contactSenderResponse.data[0].Ref;

      // 3. Отримуємо відділення відправника
      const senderWarehousesResponse =
        await NovaPoshtaServices.getSenderWarehouses(
          '8d5a980d-391c-11dd-90d9-001a92567626'
        ); // Ref Києва
      if (
        !senderWarehousesResponse.success ||
        !senderWarehousesResponse.data ||
        senderWarehousesResponse.data.length === 0
      ) {
        throw new Error('Не знайдено відділення відправника');
      }
      const senderWarehouseRef = senderWarehousesResponse.data[0].Ref;

      // 4. Створюємо отримувача
      console.log('Форма передає дані:', {
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
      });

      const recipientResponse = await NovaPoshtaServices.saveCounterparty({
        CounterpartyType: 'PrivatePerson',
        CounterpartyProperty: 'Recipient',
        CityRef: values.city,
        FirstName: values.firstName,
        LastName: values.lastName,
        MiddleName: values.middleName,
        Phone: values.phone,
      });

      console.log('Recipient response:', recipientResponse);

      console.log(
        'Відповідь від API при створенні отримувача:',
        recipientResponse
      );

      if (
        !recipientResponse.success ||
        !recipientResponse.data ||
        !recipientResponse.data[0]
      ) {
        throw new Error('Помилка при створенні отримувача');
      }
      const recipientRef = recipientResponse.data[0].Ref;

      // 5. Отримуємо контактну особу отримувача
      const contactRecipientResponse =
        await NovaPoshtaServices.getCounterpartyContactPersons(recipientRef);

      if (
        !contactRecipientResponse.success ||
        !contactRecipientResponse.data ||
        contactRecipientResponse.data.length === 0
      ) {
        throw new Error('Не знайдено контактну особу отримувача');
      }

      // Знаходимо саме ту контактну особу, яку щойно створили
      const contactPerson = contactRecipientResponse.data.find(
        person =>
          person.FirstName === values.firstName &&
          person.LastName === values.lastName &&
          person.MiddleName === values.middleName
      );

      if (!contactPerson) {
        throw new Error('Не знайдено контактну особу з такими ПІБ');
      }
      const contactRecipientRef = contactPerson.Ref;

      const senderData = {
        CitySender: '8d5a980d-391c-11dd-90d9-001a92567626', // Ref Києва
        SenderAddress: senderWarehouseRef,
        Sender: senderRef,
        ContactSender: contactSenderRef,
        SendersPhone: '+380991112233',
      };

      const recipientData = {
        CityRecipient: values.city,
        RecipientAddress: values.warehouse,
        RecipientsPhone: values.phone,
        FirstName: values.firstName, // Передаємо ім'я напряму з форми
        LastName: values.lastName, // Передаємо прізвище напряму з форми
        MiddleName: values.middleName, // Передаємо по батькові напряму з форми
        Recipient: recipientRef,
        ContactRecipient: contactRecipientRef,
      };

      console.log('Дані для створення накладної:', {
        recipientData,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
      });

      const seatsAmount = 1;
      const totalWeight = items.reduce(
        (acc, item) => acc + item.quantity * 0.5,
        0.5
      );
      const cargoData = {
        Weight: totalWeight,
        ServiceType: 'WarehouseWarehouse' as const,
        SeatsAmount: seatsAmount,
        Description: items
          .map(item => `${item.name} x${item.quantity}`)
          .join(', '),
        OptionsSeat: [
          {
            volumetricVolume: 0.1, // мінімальний об'єм
            volumetricWidth: 10,
            volumetricLength: 10,
            volumetricHeight: 10,
            weight: totalWeight,
          },
        ],
      };

      const waybillNumber = await NovaPoshtaServices.createWaybill(
        senderData,
        recipientData,
        cargoData,
        values.payerType,
        values.paymentMethod
      );

      // --- Формуємо дані для createOrder ---
      const customerData = {
        name: `${values.lastName} ${values.firstName} ${values.middleName}`,
        email: values.email,
        phone: values.phone,
        warehouse: values.warehouse,
        city: values.city,
        waybill_number: waybillNumber,
      };

      // Перевіряємо, чи не існує вже замовлення з таким waybill_number
      try {
        const { data: existingOrder, error } = await supabase
          .from('orders')
          .select('id')
          .eq('waybill_number', waybillNumber);

        if (error) {
          console.error('Error checking existing order:', error);
        }

        if (existingOrder && existingOrder.length > 0) {
          console.log(
            'Order with this waybill number already exists:',
            existingOrder
          );
          toast({
            title: 'Помилка',
            description: 'Замовлення з таким номером накладної вже існує',
            variant: 'destructive',
          });
          return;
        }
      } catch (error) {
        console.error('Error checking for duplicate order:', error);
      }

      // Викликаємо createOrder з utils
      const orderResult = await createOrder(
        customerData,
        items,
        user ? user.id : undefined
      );
      if (!orderResult) {
        throw new Error('Помилка при збереженні замовлення');
      }

      clearCart();
      onSubmit(values);
    } catch (error) {
      console.error('Nova Poshta error:', error);
      toast({
        title: 'Помилка при створенні замовлення',
        description:
          error instanceof Error ? error.message : 'Спробуйте ще раз',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 py-8 px-2 md:px-0">
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-2xl font-bold mb-6 text-primary-foreground text-center md:text-left">
            Ваше замовлення
          </h2>
          {items.length === 0 ? (
            <div className="text-center py-8 text-lg text-gray-500">
              Кошик порожній
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex flex-col p-2 sm:p-3 border rounded-lg bg-neutral-50 hover:shadow-md transition min-h-[110px]"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded border"
                    />
                    <div className="flex flex-col items-start w-full">
                      <h3 className="font-semibold text-base">{item.name}</h3>
                      <p className="text-xs text-gray-500">
                        Ціна: {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-7 w-7"
                        >
                          -
                        </Button>
                        <span className="font-semibold text-base w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-7 w-7"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full mt-2">
                    <p className="font-semibold text-base text-primary-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="h-7 w-7"
                      title="Видалити"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-base">
                  <span>Сума:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {shipping && shipping.cost > 0 && (
                  <>
                    <div className="flex justify-between text-base">
                      <span>Доставка:</span>
                      <span>{formatPrice(shipping.cost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-primary mt-2">
                      <span>Разом:</span>
                      <span>{formatPrice(total + shipping.cost)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-2xl font-bold mb-6 text-primary-foreground text-center md:text-left">
            Оформлення замовлення
          </h2>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ім'я</FormLabel>
                      <FormControl>
                        <Input placeholder="Введіть ваше ім'я" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Прізвище</FormLabel>
                      <FormControl>
                        <Input placeholder="Введіть ваше прізвище" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>По батькові</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введіть ваше по батькові"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                        <Input placeholder="+380XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormLabel>Доставка</FormLabel>
                <NovaPoshtaSelector onSelect={handleNovaPoshtaSelect} />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="payerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Хто оплачує доставку</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Виберіть хто оплачує" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sender">Відправник</SelectItem>
                          <SelectItem value="Recipient">Отримувач</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Спосіб оплати</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Виберіть спосіб оплати" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Готівка</SelectItem>
                          <SelectItem value="NonCash">Безготівка</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-kitty-pink hover:bg-pink-400 transition"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <PawPrint className="mr-2 h-5 w-5 animate-spin" />
                    Обробка...
                  </>
                ) : (
                  'Оформити замовлення'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
