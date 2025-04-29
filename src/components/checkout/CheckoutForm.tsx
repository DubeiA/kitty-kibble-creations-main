
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { checkoutFormSchema, type CheckoutFormValues } from '@/schemas/checkoutSchema';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useEffect } from 'react';

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => void;
  isProcessing: boolean;
  defaultValues?: Partial<CheckoutFormValues>;
}

export const CheckoutForm = ({ onSubmit, isProcessing, defaultValues }: CheckoutFormProps) => {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
    },
  });

  const { saveFormData } = useFormPersistence(form.getValues(), 'checkout-form');

  useEffect(() => {
    // Apply defaultValues when they change
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        if (value) {
          form.setValue(key as keyof CheckoutFormValues, value);
        }
      });
    }
  }, [defaultValues, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      saveFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, saveFormData]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ім'я та прізвище</FormLabel>
              <FormControl>
                <Input placeholder="Іван Петренко" {...field} />
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
                <Input type="email" placeholder="your@email.com" {...field} />
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
                <Input placeholder="+380501234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Адреса доставки</FormLabel>
              <FormControl>
                <Input placeholder="вул. Шевченка 1, кв. 1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Місто</FormLabel>
              <FormControl>
                <Input placeholder="Київ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing}
          >
            {isProcessing ? "Обробка..." : "Оплатити"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
