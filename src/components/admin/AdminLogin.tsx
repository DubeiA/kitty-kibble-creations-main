import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/currentUser';

export function ProtectedRoute({ children, onlyAdmin = false }) {
  const { user, loading } = useCurrentUser();

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

  if (loading) return <div>Завантаження...</div>;

  if (!user) {
    // Неавторизований — редірект на логін
    localStorage.removeItem('cart');
    return <Navigate to="/auth" replace />;
  }

  if (onlyAdmin && user.email !== ADMIN_EMAIL) {
    // Не адмін — редірект на клієнтський кабінет
    return <Navigate to="/dashboard" replace />;
  }

  if (!onlyAdmin && user.email === ADMIN_EMAIL) {
    // Адмін намагається зайти в клієнтський кабінет — редірект в адмінку
    return <Navigate to="/admin" replace />;
  }

  // Доступ дозволено
  return children;
}

export default ProtectedRoute;

// import { useState } from 'react';
// import { supabase } from '@/integrations/supabase/client';

// const ADMIN_EMAIL = "admin@site.com"; // або перевіряй по id

// export function AdminLogin({ onLogin }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     if (error) {
//       setError('Невірний email або пароль');
//       return;
//     }
//     if (email === ADMIN_EMAIL) {
//       onLogin();
//     } else {
//       setError('Ви не маєте прав адміністратора');
//     }
//   };

//   return (

//     <form onSubmit={handleLogin}>
//       <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
//       <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Пароль" />
//       <button type="submit">Увійти</button>
//       {error && <div>{error}</div>}
//     </form>
//   );
// }

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { useToast } from '@/hooks/use-toast';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// interface AdminLoginProps {
//   onLogin: () => void;
// }

// const ADMIN_PASSWORD = 'admin123'; // In a real app, use proper authentication

// export function AdminLogin({ onLogin }: AdminLoginProps) {
//   const [password, setPassword] = useState('');
//   const { toast } = useToast();

//   const handleLogin = () => {
//     if (password === ADMIN_PASSWORD) {
//       localStorage.setItem('adminAuthenticated', 'true');
//       onLogin();
//       toast({
//         title: "Успішний вхід",
//         description: "Ласкаво просимо до панелі адміністратора",
//       });
//     } else {
//       toast({
//         title: "Помилка входу",
//         description: "Невірний пароль",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4 max-w-md mx-auto">
//       <h2 className="text-xl font-medium">Вхід для адміністратора</h2>
//       <Input
//         type="password"
//         placeholder="Введіть пароль"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
//       />
//       <Button onClick={handleLogin}>Увійти</Button>
//       <p className="text-sm text-muted-foreground text-center">
//         Для демо використовуйте пароль: admin123
//       </p>
//     </div>
//   );
// }
