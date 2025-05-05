import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
export type ProductCategory = Database['public']['Enums']['product_category'];
export type AnimalType = Database['public']['Enums']['animal_type'];

export const useProducts = (
  category?: string,
  page: number = 1,
  limit: number = 15
) => {
  return useQuery({
    queryKey: ['products', category, page, limit],
    queryFn: async () => {
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (category && category !== 'all') {
        if (['cat', 'dog', 'fish'].includes(category)) {
          query = query.eq('animal_type', category as AnimalType);
        } else if (
          ['dry', 'wet', 'treats', 'subscription'].includes(category)
        ) {
          query = query.eq('category', category as ProductCategory);
        }
      }
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return { data: data || [], count, error };
    },
    staleTime: 5 * 60 * 1000, // Дані вважаються свіжими 5 хвилин
    gcTime: 30 * 60 * 1000, // Кеш зберігається 30 хвилин
  });
};
