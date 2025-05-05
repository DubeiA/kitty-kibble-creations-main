import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import CategorySelector from '../components/CategorySelector';
import ProductListing from '../components/ProductListing';
import WhyOurFood from '../components/WhyOurFood';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import LoadingPaws from '../components/LoadingPaws';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProducts } from '@/hooks/useProducts';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isMobile = useIsMobile();
  const maxProducts = isMobile ? 9 : 15;

  // Отримай всі продукти для фільтрації улюблених
  const { data: result, error } = useProducts('all', 1, 100);
  const products = result?.data || [];
  // Фільтруй тільки улюблені і обмеж до maxProducts
  const favoriteProducts = products
    .filter(product => product.is_favorite)
    .slice(0, maxProducts);

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';

    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    // --- Додаємо цей useEffect ---
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 2000); // невелика затримка, щоб DOM встиг намалюватися
    }
    // ----------------------------

    // Cleanup
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [location]);

  if (isLoading) {
    return <LoadingPaws />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <Hero />
        <CategorySelector />
        <ProductListing products={favoriteProducts} />
        <WhyOurFood />
        <Testimonials />
        <FAQ />
      </main>
      <NewsletterAndFooter />
      <ScrollToTopButton />
    </div>
  );
};

export default Index;
