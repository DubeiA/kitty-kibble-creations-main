import { useState } from 'react';
import { Check, Heart, LeafyGreen, PawPrint, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { useProducts, ProductCategory, AnimalType } from '@/hooks/useProducts';

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

// Get cart from localStorage
const getCartFromStorage = () => {
  const savedCart = localStorage.getItem('cart');
  const cart = savedCart ? JSON.parse(savedCart) : [];

  // Ensure all cart items have their cached images
  return cart.map(item => ({
    ...item,
    image: localStorage.getItem(`product-image-${item.id}`) || item.image,
  }));
};

// Save cart to localStorage
const saveCartToStorage = cart => {
  localStorage.setItem('cart', JSON.stringify(cart));
  // Dispatch custom event for cart updates
  window.dispatchEvent(new Event('cartUpdated'));
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

  const selectedCategory = searchParams.get('category') || 'all';

  // console.log(products);

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
    // Get current cart
    const currentCart = getCartFromStorage();

    // Get image URL - either from the product or use fallback
    const imageUrl = product.image_url || getFallbackImage(product.animal_type);

    // Cache the image URL in localStorage
    localStorage.setItem(`product-image-${product.id}`, imageUrl);

    // Check if product is already in cart
    const existingProductIndex = currentCart.findIndex(
      item => item.id === product.id
    );

    if (existingProductIndex !== -1) {
      // If product exists, increase quantity
      currentCart[existingProductIndex].quantity += 1;
      // Ensure image is preserved
      currentCart[existingProductIndex].image = imageUrl;
    } else {
      // If not, add new product to cart
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: imageUrl,
      });
    }

    // Save updated cart to localStorage
    saveCartToStorage(currentCart);

    // Show success toast
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

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
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card group">
                <div className="relative overflow-hidden">
                  <img
                    src={
                      imageErrors[product.id]
                        ? getFallbackImage(product.animal_type)
                        : product.image_url ||
                          getFallbackImage(product.animal_type)
                    }
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() =>
                      handleImageError(product.id, product.animal_type)
                    }
                  />
                  {product.is_favorite && (
                    <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm">
                      <Heart size={16} className="text-red-500 fill-current" />
                    </div>
                  )}
                </div>

                <div className="p-5 bg-white">
                  <div className="flex gap-2 mb-2">
                    {product.category === 'dry' && (
                      <span className="cat-badge bg-kitty-yellow/30 text-amber-700">
                        <LeafyGreen size={14} />
                        Суха їжа
                      </span>
                    )}
                    {product.in_stock && (
                      <span className="cat-badge bg-kitty-green/30 text-green-700">
                        <Check size={14} />В наявності
                      </span>
                    )}
                    {product.category === 'wet' && (
                      <span className="cat-badge bg-kitty-blue/30 text-blue-700">
                        <PawPrint size={14} />
                        Волога їжа
                      </span>
                    )}
                  </div>

                  <h3 className="font-display font-semibold text-xl mb-2">
                    {product.name}
                  </h3>
                  <p className="text-neutral-600 mb-3">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      className="btn-primary py-2"
                      onClick={() => handleAddToCart(product)}
                    >
                      Додати в кошик
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
