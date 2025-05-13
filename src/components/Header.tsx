import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, ShoppingCart } from 'lucide-react';
import AuthButtons from './AuthButtons';
import { useCurrentUser } from '@/hooks/currentUser';
import { useScrollToSection } from '@/hooks/useScrollToSection';
import { useCartStore } from '@/store/cartStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const location = useLocation();
  const isShopPage = location.pathname === '/shop';
  const { user } = useCurrentUser();
  const items = useCartStore(state => state.items);

  const scrollToSection = useScrollToSection();

  // Update cart count when items change
  useEffect(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    setCartItemsCount(itemCount);
  }, [items]);

  // Scroll to top when navigating
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <header className="py-4 px-4 md:px-8 sticky top-0 bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-kitty-pink p-2 rounded-full">
            <img
              loading="lazy"
              src={`${import.meta.env.BASE_URL}lovable-uploads/460ac5b8-846f-4b20-aef4-7961c51b26f1.png`}
              alt="Kitty Kibble Creations Logo"
              className="w-6 h-6 object-cover rounded-full"
            />
          </div>
          <span className="font-display font-bold text-xl md:text-2xl">
            Kitty Kibble Creations
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/shop"
            className={`font-medium transition-colors relative ${
              isShopPage
                ? 'text-primary-foreground'
                : 'hover:text-primary-foreground'
            } ${
              isShopPage
                ? 'after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-kitty-pink'
                : ''
            }`}
          >
            Shop
          </Link>
          <button
            className="font-medium hover:text-primary-foreground transition-colors bg-transparent border-none"
            onClick={() => scrollToSection('why-our-food')}
          >
            Why Our Food?
          </button>
          <button
            className="font-medium hover:text-primary-foreground transition-colors bg-transparent border-none"
            onClick={() => scrollToSection('reviews')}
          >
            Reviews
          </button>
          <button
            className="font-medium hover:text-primary-foreground transition-colors"
            onClick={() => scrollToSection('faq')}
          >
            FAQ
          </button>
          <button
            className="font-medium hover:text-primary-foreground transition-colors"
            onClick={() => scrollToSection('contact')}
          >
            Contact
          </button>
        </nav>

        {/* Cart, Auth & CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/checkout" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
          <AuthButtons />
          <Link to="/shop" className="btn-primary">
            Shop Now
            <img
              loading="lazy"
              src={`${import.meta.env.BASE_URL}lovable-uploads/460ac5b8-846f-4b20-aef4-7961c51b26f1.png`}
              alt="Cat food"
              className="w-5 h-5 object-cover rounded-full"
            />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/checkout" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </Link>
          <button
            className="text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md p-4 flex flex-col gap-4">
          <Link
            to="/shop"
            className={`font-medium p-2 hover:bg-neutral-100 rounded-md ${
              isShopPage ? 'bg-kitty-pink/10 text-primary-foreground' : ''
            }`}
          >
            Shop
          </Link>
          <a
            href="/#/why-our-food"
            className="font-medium p-2 hover:bg-neutral-100 rounded-md"
          >
            Why Our Food?
          </a>
          <a
            href="/#/reviews"
            className="font-medium p-2 hover:bg-neutral-100 rounded-md"
          >
            Reviews
          </a>
          <a
            href="/#/faq"
            className="font-medium p-2 hover:bg-neutral-100 rounded-md"
          >
            FAQ
          </a>
          <a
            href="/#/contact"
            className="font-medium p-2 hover:bg-neutral-100 rounded-md"
          >
            Contact
          </a>
          <AuthButtons />
          <Link to="/shop" className="btn-primary mt-2">
            Shop Now
            <img
              loading="lazy"
              src={`${import.meta.env.BASE_URL}lovable-uploads/460ac5b8-846f-4b20-aef4-7961c51b26f1.png`}
              alt="Cat food"
              className="w-5 h-5 object-cover rounded-full"
            />
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
