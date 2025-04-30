import { useState, useEffect } from 'react';
import ProductListing from '../components/ProductListing';
import CategorySelector from '../components/CategorySelector';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import LoadingPaws from '../components/LoadingPaws';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';

const Shop = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data: result, error } = useProducts('all');

  const countProd = result?.count;
  const totalPages = Math.ceil(countProd / limit);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return <LoadingPaws />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <CategorySelector />
        <ProductListing page={page} limit={limit} />
        <div className="flex items-center justify-center gap-2 mb-6 ">
          {' '}
          <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Назад
          </Button>
          <span className="text-sm">Сторінка {page}</span>{' '}
          <Button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Вперед
          </Button>
        </div>
      </main>
      <NewsletterAndFooter />
      <ScrollToTopButton />
    </div>
  );
};

export default Shop;
