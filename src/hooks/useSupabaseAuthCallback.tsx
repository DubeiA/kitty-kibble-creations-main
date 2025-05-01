import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

function parseHashParams() {
  if (window.location.hash && window.location.hash.includes('access_token')) {
    // Видаляємо зайвий #, якщо є
    const hash = window.location.hash.replace(/^#\/?/, '');
    const params = new URLSearchParams(hash);
    return {
      access_token: params.get('access_token'),
      refresh_token: params.get('refresh_token'),
      expires_in: params.get('expires_in'),
      token_type: params.get('token_type'),
    };
  }
  return null;
}

export const useSupabaseAuthCallback = () => {
  useEffect(() => {
    // 1. Парсимо токени з хеша і зберігаємо сесію вручну
    const tokens = parseHashParams();

    if (tokens && tokens.access_token && tokens.refresh_token) {
      supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      // Очищаємо хеш з адреси
      window.location.hash = '#/';
    }

    // 2. Перевіряємо, чи є сесія (автоматично зберігає токени, якщо вони є в URL)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Ви залогінені, тут можна зробити редірект або оновити стан
        // Наприклад, window.location.replace('/dashboard');
      }
    });

    // 3. Слухаємо зміни сесії (наприклад, після OAuth)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Тут можна оновити глобальний стан користувача, якщо треба
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
};
