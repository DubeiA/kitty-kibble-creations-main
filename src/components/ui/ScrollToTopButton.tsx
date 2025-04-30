// src/components/ScrollToTopButton.tsx
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react'; // або будь-яка інша іконка

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return visible ? (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-kitty-pink text-white rounded-full p-3 shadow-lg hover:bg-kitty-blue transition"
      aria-label="Прокрутити вгору"
    >
      <ArrowUp size={24} />
    </button>
  ) : null;
};

export default ScrollToTopButton;
