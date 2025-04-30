import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormValues, RegisterFormValues, loginSchema, registerSchema } from '@/schemas/checkoutSchema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL; // або список email-ів адміністраторів
  

const Auth = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailConfirmationNeeded, setEmailConfirmationNeeded] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });
  
 const handleLogin = async (data: LoginFormValues) => {
  setIsLoggingIn(true);

  try {
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
     localStorage.removeItem('cart'); // Очищення кошика при вході

    if (error) {
      throw error;
    }

    // Перевіряємо, чи є запис у customers
    const user = loginData.user;
    if (user) {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (customerError && customerError.code === 'PGRST116') {
        // Якщо запису немає — створюємо
        await supabase
          .from('customers')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || '',
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
    }

    toast({
      title: "Успішний вхід",
      description: "Ви успішно увійшли в аккаунт",
    });

    if (user.email === ADMIN_EMAIL) {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  } catch (error: any) {
    // ... існуюча обробка помилок ...
  } finally {
    setIsLoggingIn(false);
  }
};
  
  const handleRegister = async (data: RegisterFormValues) => {
    setIsRegistering(true);
    
    try {
      // Додаємо перевірку на обмеження домену
      const emailDomain = data.email.split('@')[1];
      if (!emailDomain || !['gmail.com', 'ukr.net', 'yahoo.com', 'outlook.com', 'hotmail.com', 'i.ua', 'protonmail.com'].includes(emailDomain)) {
        throw new Error("unsupported_email_domain");
      }
      
      const { error, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          }
        }
      });
      
      if (error) {
        throw error;
      }

      if (signUpData?.user) {
  await supabase
    .from('customers')
    .insert({
      id: signUpData.user.id, // id з auth
      email: data.email,
      name: data.name,
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
}
      
      setEmailConfirmationNeeded(true);
      setConfirmationEmail(data.email);
      
      toast({
        title: "Реєстрацію майже завершено",
        description: "Перевірте вашу пошту і підтвердіть email-адресу щоб завершити реєстрацію.",
      });
    } catch (error: any) {
      console.error(error);
      
      let errorMessage = "Не вдалося зареєструвати аккаунт";
      
      if (error.message.includes("already registered")) {
        errorMessage = "Користувач з такою email-адресою вже існує";
      } else if (error.message.includes("invalid")) {
        errorMessage = "Невірний формат email-адреси";
      } else if (error.message.includes("unsupported_email_domain")) {
        errorMessage = "Використовуйте тільки популярні поштові сервіси: Gmail, Ukr.net, Yahoo, Outlook, Hotmail, i.ua, Protonmail";
      }
      
      toast({
        title: "Помилка реєстрації",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  const resendConfirmationEmail = async () => {
    if (!confirmationEmail) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: confirmationEmail,
      });
      
      if (error) throw error;
      
      toast({
        title: "Лист надіслано",
        description: "Ми надіслали вам новий лист для підтвердження email-адреси.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Помилка",
        description: "Не вдалося надіслати лист. Спробуйте пізніше.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-display">Вхід до аккаунту</CardTitle>
              <CardDescription>
                Увійдіть або створіть аккаунт для доступу до замовлень
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailConfirmationNeeded ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Підтвердіть email-адресу</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ми надіслали лист підтвердження на адресу <strong>{confirmationEmail}</strong>. Будь ласка, перейдіть за посиланням у листі, щоб активувати аккаунт.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Не отримали лист?</p>
                    <Button onClick={resendConfirmationEmail} variant="outline" size="sm">
                      Надіслати повторно
                    </Button>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => {
                        setEmailConfirmationNeeded(false);
                        loginForm.reset();
                        registerForm.reset();
                      }}
                    >
                      Повернутися до форми входу
                    </Button>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="login">
                  <TabsList className="grid grid-cols-2 mb-8 w-full">
                    <TabsTrigger value="login">Вхід</TabsTrigger>
                    <TabsTrigger value="register">Реєстрація</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
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
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Пароль</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Ваш пароль" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full" disabled={isLoggingIn}>
                          {isLoggingIn ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Вхід...
                            </>
                          ) : (
                            "Увійти"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ім'я</FormLabel>
                              <FormControl>
                                <Input placeholder="Ваше ім'я" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                              <p className="text-xs text-muted-foreground mt-1">
                                Використовуйте Gmail, Ukr.net, Yahoo, Outlook, Hotmail, i.ua або Protonmail
                              </p>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Пароль</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Мінімум 6 символів" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Підтвердження паролю</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Повторіть пароль" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full" disabled={isRegistering}>
                          {isRegistering ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Реєстрація...
                            </>
                          ) : (
                            "Зареєструватися"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <NewsletterAndFooter />
    </div>
  );
};

export default Auth;
