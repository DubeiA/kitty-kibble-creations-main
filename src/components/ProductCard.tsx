import { Check, Heart, LeafyGreen, PawPrint, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimalType } from '@/hooks/useProducts';
import { useState, useEffect } from 'react';

const fallbackImages = {
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=256&fit=crop&auto=format',
  dog: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=256&fit=crop&auto=format',
  fish: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=300&h=256&fit=crop&auto=format',
  default: '/placeholder.svg',
};

type ProductCardProps = {
  product: any; // бажано типізувати!
  imageError: boolean;
  onImageError: () => void;
  onAddToCart: (product: any) => void;
};

const ProductCard = ({
  product,
  imageError,
  onImageError,
  onAddToCart,
}: ProductCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const getOptimizedImageUrl = (url: string) => {
    if (url.includes('unsplash.com')) {
      return `${url}?w=300&h=256&fit=crop&auto=format&fm=webp`;
    }
    return url;
  };

  useEffect(() => {
    const imageUrl = imageError
      ? fallbackImages[product.animal_type] || fallbackImages.default
      : product.image_url ||
        fallbackImages[product.animal_type] ||
        fallbackImages.default;

    const optimizedUrl = getOptimizedImageUrl(imageUrl);
    setCurrentImageUrl(optimizedUrl);

    // Перевіряємо кеш
    const cachedUrl = localStorage.getItem(`product-image-${product.id}`);
    if (cachedUrl && cachedUrl === optimizedUrl) {
      setCachedImageUrl(cachedUrl);
      setIsImageLoaded(true);
      return;
    }

    // Якщо URL змінився або немає в кеші, завантажуємо
    const img = new Image();
    img.src = optimizedUrl;

    img.onload = () => {
      setIsImageLoaded(true);
      // Зберігаємо в кеш
      localStorage.setItem(`product-image-${product.id}`, optimizedUrl);
      setCachedImageUrl(optimizedUrl);
    };

    img.onerror = () => {
      // Якщо помилка завантаження, видаляємо з кешу
      localStorage.removeItem(`product-image-${product.id}`);
      setCachedImageUrl(null);
      setIsImageLoaded(false);
      onImageError();
    };
  }, [
    product.id,
    product.image_url,
    product.animal_type,
    imageError,
    onImageError,
  ]);

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden">
        {!isImageLoaded && (
          <div className="w-full h-64 bg-neutral-200 animate-pulse" />
        )}
        <img
          loading="lazy"
          decoding="async"
          width="300"
          height="256"
          src={cachedImageUrl || currentImageUrl || fallbackImages.default}
          alt={product.name}
          className={`w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={() => {
            localStorage.removeItem(`product-image-${product.id}`);
            setCachedImageUrl(null);
            setIsImageLoaded(false);
            onImageError();
          }}
          // fetchPriority="low"
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
            onClick={() => onAddToCart(product)}
          >
            Додати в кошик
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
