
import { useState, useEffect } from 'react';
import ProductListing from '../components/ProductListing';
import CategorySelector from '../components/CategorySelector';
import Header from '../components/Header';
import NewsletterAndFooter from '../components/NewsletterAndFooter';
import LoadingPaws from '../components/LoadingPaws';

const Shop = () => {
  const [isLoading, setIsLoading] = useState(true);

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
        <ProductListing />
      </main>
      <NewsletterAndFooter />
    </div>
  );
};

export default Shop;
