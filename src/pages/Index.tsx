
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

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Cleanup
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  if (isLoading) {
    return <LoadingPaws />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <Hero />
        <CategorySelector />
        <ProductListing />
        <WhyOurFood />
        <Testimonials />
        <FAQ />
      </main>
      <NewsletterAndFooter />
    </div>
  );
};

export default Index;
