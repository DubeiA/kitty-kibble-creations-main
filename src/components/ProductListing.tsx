import { useState, useMemo } from 'react';
import { Check, Heart, LeafyGreen, PawPrint, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { useProducts, ProductCategory, AnimalType } from '@/hooks/useProducts';
import ProductCard from './ProductCard';
import { useCartStore } from '@/store/cartStore';

// Types for product filters
type ProductFilterType =
  | 'all'
  | 'kitten'
  | 'puppy'
  | 'fry'
  | 'adult'
  | 'senior'
  | 'mature'
  | 'grain-free'
  | 'sensitive'
  | 'high-protein';

type ProductListingProps = {
  products?: any[]; // або твій тип Product[]
  page?: number; // для Shop
  limit?: number; // для Shop
};

const categoryTitles = {
  all: 'All Pet Food Products',
  cat: 'Premium Cat Food Collection',
  dog: 'Quality Dog Food Selection',
  fish: 'Specialized Fish Food Products',
  dry: 'Dry Food Collection',
  wet: 'Premium Wet Food',
  treats: 'Special Treats & Rewards',
  subscription: 'Monthly Subscription Boxes',
};

// Default fallback images by animal type
const fallbackImages = {
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
  dog: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
  fish: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5',
  default: '/placeholder.svg',
};

const FILTERS = {
  cat: [
    { value: 'all', label: 'All Cat Food' },
    { value: 'kitten', label: 'Kitten' },
    { value: 'adult', label: 'Adult Cat' },
    { value: 'senior', label: 'Senior Cat' },
    { value: 'grain-free', label: 'Grain-Free' },
    { value: 'sensitive', label: 'Sensitive Digestion' },
    { value: 'high-protein', label: 'High-Protein Formula' },
  ],
  dog: [
    { value: 'all', label: 'All Dog Food' },
    { value: 'puppy', label: 'Puppy' },
    { value: 'adult', label: 'Adult Dog' },
    { value: 'senior', label: 'Senior Dog' },
    { value: 'grain-free', label: 'Grain-Free' },
    { value: 'sensitive', label: 'Sensitive Stomach' },
    { value: 'high-protein', label: 'High-Protein Formula' },
  ],
  fish: [
    { value: 'all', label: 'All Fish Food' },
    { value: 'fry', label: 'Fry' },
    { value: 'adult', label: 'Adult Fish' },
    { value: 'mature', label: 'Mature Fish' },
    { value: 'grain-free', label: 'Grain-Free (Low-Filler)' },
    { value: 'sensitive', label: 'For Sensitive Species' },
    { value: 'high-protein', label: 'High-Protein Feed' },
  ],
};

const ProductListing = ({ products, page, limit }: ProductListingProps) => {
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<ProductFilterType>('all');
  const { toast } = useToast();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const addToCart = useCartStore(state => state.addToCart);

  const selectedCategory = searchParams.get('category') || 'all';

  const {
    data: fetchedProducts = { data: [], count: 0 },
    isLoading,
    error,
  } = useProducts(selectedCategory, page, limit);

  const productsToRender = products ?? fetchedProducts.data ?? [];

  // Filter products based on text content to avoid type conflicts
  const filteredProducts = productsToRender.filter(p => {
    if (selectedCategory === 'all') return true;

    // Якщо вибрано "Dog Food", "Cat Food", "Fish Food" — фільтруємо по тварині
    if (activeFilter === 'all') return p.animal_type === selectedCategory;

    // Для life_stage (kitten, puppy, fry, adult, senior, mature)
    if (
      ['kitten', 'puppy', 'fry', 'adult', 'senior', 'mature'].includes(
        activeFilter
      )
    ) {
      return (
        p.animal_type === selectedCategory && p.life_stage === activeFilter
      );
    }

    // Для категорій (grain-free, sensitive, high-protein)
    if (['grain-free', 'sensitive', 'high-protein'].includes(activeFilter)) {
      return p.animal_type === selectedCategory && p.category === activeFilter;
    }

    return false;
  });

  const handleImageError = (productId: string, animalType: AnimalType) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true,
    }));
  };

  const getFallbackImage = (animalType: AnimalType) => {
    return (
      fallbackImages[animalType as keyof typeof fallbackImages] ||
      fallbackImages.default
    );
  };

  const handleAddToCart = product => {
    // Get image URL - either from the product or use fallback
    const imageUrl = product.image_url || getFallbackImage(product.animal_type);
    // Cache the image URL in localStorage
    localStorage.setItem(`product-image-${product.id}`, imageUrl);
    // Додаємо товар у Zustand-кошик
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: imageUrl,
    });
    // Show success toast
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const productCards = useMemo(
    () =>
      filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          imageError={!!imageErrors[product.id]}
          onImageError={() => handleImageError(product.id, product.animal_type)}
          onAddToCart={handleAddToCart}
        />
      )),
    [filteredProducts, imageErrors]
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-600">Завантаження продуктів...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-600">
          Помилка завантаження продуктів. Спробуйте оновити сторінку.
        </p>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 md:px-8 bg-neutral-100">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4">
          {categoryTitles[selectedCategory as keyof typeof categoryTitles]}
        </h2>
        <p className="text-lg text-neutral-600 text-center max-w-2xl mx-auto mb-12">
          Відкрийте для себе їжу, яка робить домашніх тварин щасливими
        </p>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {FILTERS[selectedCategory as keyof typeof FILTERS]?.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value as ProductFilterType)}
              className={`px-4 py-2 rounded-full transition-all duration-300 text-sm md:text-base ${
                activeFilter === f.value
                  ? 'bg-kitty-blue text-primary-foreground'
                  : 'bg-white hover:bg-neutral-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productCards}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-neutral-600">
              Немає продуктів у цій категорії.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <button className="btn-primary text-lg">
            Переглянути всі продукти
            <PawPrint size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductListing;
