import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, User, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const AuthButtons = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    // (опціонально) підписка на зміни сесії
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <LogIn size={16} />
          Увійти
        </Button>
      </Link>
    );
  }

  // Якщо це адмін
  if (user.email === ADMIN_EMAIL) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/admin">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ShieldCheck size={16} />
            Адмінка
          </Button>
        </Link>
        <button
          className="btn-secondary"
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('cart'); 
            window.location.href = "/auth";
          }}
        >
          Вийти
        </button>
      </div>
    );
  }

  // Якщо це звичайний користувач
  return (
    <div className="flex items-center gap-2">
      <Link to="/dashboard">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User size={16} />
          Кабінет
        </Button>
      </Link>
      <button
        className="btn-secondary"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/auth";
        }}
      >
        Вийти
      </button>
    </div>
  );
};

export default AuthButtons;
