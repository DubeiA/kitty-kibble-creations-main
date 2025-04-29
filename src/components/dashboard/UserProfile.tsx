import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types/checkout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Ім'я повинно містити мінімум 2 символи",
  }),
  email: z.string().email({
    message: "Введіть коректну email адресу",
  }).optional(),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserProfile = ({ user }: { user: any }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Customer | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: user?.email || '',
      phone: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const customerData: Customer = data as Customer;
          setProfile(customerData);
          
          form.reset({
            name: customerData.name || '',
            email: customerData.email || user.email,
            phone: customerData.phone || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Помилка",
          description: "Не вдалося завантажити дані профілю",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, form, toast]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('customers')
        .update({
          name: data.name,
          phone: data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Профіль оновлено",
        description: "Ваші дані успішно оновлено",
      });
      
      if (profile) {
        setProfile({
          ...profile,
          name: data.name,
          phone: data.phone || null,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося оновити дані профілю",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Завантаження профілю...</p>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-medium mb-6">Персональні дані</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled {...field} />
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
                  <Input placeholder="Введіть ваш номер телефону" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Зберегти зміни
          </Button>
        </form>
      </Form>
    </Card>
  );
};

export default UserProfile;
