
import * as z from 'zod';

export const checkoutFormSchema = z.object({
  name: z.string().min(2, { message: "Ім'я повинно містити мінімум 2 символи" }),
  email: z.string().email({ message: "Введіть коректну email адресу" }),
  phone: z.string().min(10, { message: "Введіть коректний номер телефону" }),
  address: z.string().min(5, { message: "Введіть повну адресу доставки" }),
  city: z.string().min(2, { message: "Введіть назву міста" }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: "Введіть коректну email адресу" }),
  password: z.string().min(6, { message: "Пароль повинен містити мінімум 6 символів" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Ім'я повинно містити мінімум 2 символи" }),
  email: z.string().email({ message: "Введіть коректну email адресу" }),
  password: z.string().min(6, { message: "Пароль повинен містити мінімум 6 символів" }),
  confirmPassword: z.string().min(6, { message: "Пароль повинен містити мінімум 6 символів" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
