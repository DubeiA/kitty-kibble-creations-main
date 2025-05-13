import {
  Check,
  Heart,
  LeafyGreen,
  PawPrint,
  ShoppingCart,
  Gift,
  Wheat,
  Dog,
  Dumbbell,
  Shield,
  Layers,
  CircleDot,
  AlignJustify,
  Cookie,
  Pill,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnimalType } from '@/hooks/useProducts';
import { useState, useEffect } from 'react';
import { WeightSelector } from '@/components/WeightSelector';
import { WeightValue } from '@/types/weight';
import { WEIGHT_CONFIGS } from '@/constants/weightOptions';
import { useCartStore } from '@/store/cartStore';

const fallbackImages = {
  cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=256&fit=crop&auto=format',
  dog: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=256&fit=crop&auto=format',
  fish: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=300&h=256&fit=crop&auto=format',
  default:
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=256&fit=crop&auto=format',
};

const CATEGORY_BADGES: Record<
  string,
  { label: string; color: string; icon: JSX.Element }
> = {
  dry: {
    label: 'Суха їжа',
    color: 'bg-kitty-yellow/30 text-amber-700',
    icon: <LeafyGreen size={14} />,
  },
  wet: {
    label: 'Волога їжа',
    color: 'bg-kitty-blue/30 text-blue-700',
    icon: <PawPrint size={14} />,
  },
  treats: {
    label: 'Ласощі',
    color: 'bg-kitty-purple/30 text-purple-700',
    icon: <Heart size={14} />,
  },
  subscription: {
    label: 'Підписка',
    color: 'bg-pink-100 text-pink-700',
    icon: <Gift size={14} />,
  },
  'grain-free': {
    label: 'Беззернова',
    color: 'bg-green-100 text-green-700',
    icon: <Wheat size={14} />,
  },
  senior: {
    label: 'Для літніх',
    color: 'bg-gray-100 text-gray-700',
    icon: <Dog size={14} />,
  },
  'high-protein': {
    label: 'Багато білка',
    color: 'bg-orange-100 text-orange-700',
    icon: <Dumbbell size={14} />,
  },
  sensitive: {
    label: 'Для чутливих',
    color: 'bg-blue-100 text-blue-700',
    icon: <Shield size={14} />,
  },
  flakes: {
    label: 'Пластівці',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Layers size={14} />,
  },
  granules: {
    label: 'Гранули',
    color: 'bg-lime-100 text-lime-700',
    icon: <CircleDot size={14} />,
  },
  sticks: {
    label: 'Палички',
    color: 'bg-amber-100 text-amber-700',
    icon: <AlignJustify size={14} />,
  },
  chips: {
    label: 'Чіпси',
    color: 'bg-rose-100 text-rose-700',
    icon: <Cookie size={14} />,
  },
  tablets: {
    label: 'Таблетки',
    color: 'bg-indigo-100 text-indigo-700',
    icon: <Pill size={14} />,
  },
};

type ProductCardProps = {
  product: any; // бажано типізувати!
  imageError: boolean;
  onImageError: () => void;
  onAddToCart: (product: any) => void;
};

const formatWeightLabel = (weight: WeightValue): string => {
  if (weight >= 1000) {
    return `${weight / 1000} кг`;
  }
  return `${weight} г`;
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
  const addToCart = useCartStore(state => state.addToCart);
  const { toast } = useToast();

  // Визначаємо тип товару для вибору ваги
  const getWeightType = (category: string): 'dry' | 'wet' => {
    if (category === 'treats') return 'wet';
    if (
      category === 'Flakes' ||
      category === 'Granules' ||
      category === 'Sticks' ||
      category === 'Chips' ||
      category === 'Tablets'
    ) {
      return 'dry';
    }
    return category === 'wet' ? 'wet' : 'dry';
  };

  // Отримуємо ключ для конфігурації ваг
  const weightKey = `${product.animal_type}${getWeightType(product.category).charAt(0).toUpperCase() + getWeightType(product.category).slice(1)}`;
  const weightOptions = WEIGHT_CONFIGS[weightKey]?.weights || [];

  // Використовуємо початкову вагу з бази даних або першу доступну
  const [selectedWeight, setSelectedWeight] = useState<WeightValue>(() => {
    // Спочатку перевіряємо base_weight
    if (product.base_weight) {
      return product.base_weight;
    }
    // Якщо немає base_weight, беремо найменшу вагу з доступних
    const sortedWeights = [...weightOptions].sort((a, b) => a.value - b.value);
    return sortedWeights[0]?.value || 0;
  });
  const [quantity, setQuantity] = useState(1);

  // Встановлюємо початковий множник ціни на основі вибраної ваги
  const [priceMultiplier, setPriceMultiplier] = useState(() => {
    const weightOption = weightOptions.find(
      opt => opt.value === selectedWeight
    );
    return weightOption?.priceMultiplier || 1;
  });

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

  const handleWeightChange = (weight: WeightValue, multiplier: number) => {
    setSelectedWeight(weight);
    setPriceMultiplier(multiplier);
  };

  const handleAddToCart = () => {
    // Визначаємо тип товару для вибору ваги
    const weightType = getWeightType(product.category);
    const weightConfig =
      WEIGHT_CONFIGS[
        `${product.animal_type}${weightType.charAt(0).toUpperCase() + weightType.slice(1)}`
      ];
    const weightOption = weightConfig?.weights.find(
      w => w.value === selectedWeight
    );

    if (!weightOption) {
      // Якщо вага не вибрана, беремо найменшу доступну
      const sortedWeights = [...weightConfig.weights].sort(
        (a, b) => a.value - b.value
      );
      const defaultWeight = sortedWeights[0];

      if (!defaultWeight) {
        toast({
          title: 'Помилка',
          description: 'Неможливо додати товар - немає доступних ваг',
          variant: 'destructive',
        });
        return;
      }

      setSelectedWeight(defaultWeight.value);
      setPriceMultiplier(defaultWeight.priceMultiplier);

      addToCart({
        id: product.id,
        name: product.name,
        price: product.price * defaultWeight.priceMultiplier,
        quantity: 1,
        image:
          product.image_url ||
          fallbackImages[product.animal_type] ||
          fallbackImages.default,
        selectedWeight: defaultWeight.value,
        category: product.animal_type,
        type: product.category,
      });

      toast({
        title: 'Товар додано',
        description: `${product.name} (${formatWeightLabel(defaultWeight.value)}) додано до кошика`,
      });
      return;
    }

    const price = product.price * weightOption.priceMultiplier;

    addToCart({
      id: product.id,
      name: product.name,
      price,
      quantity: 1,
      image:
        product.image_url ||
        fallbackImages[product.animal_type] ||
        fallbackImages.default,
      selectedWeight,
      category: product.animal_type,
      type: product.category,
    });

    toast({
      title: 'Товар додано',
      description: `${product.name} (${formatWeightLabel(selectedWeight)}) додано до кошика`,
    });
  };

  const categoryKey = product.category?.toLowerCase();

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
        />
        {product.is_favorite && (
          <div className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm">
            <Heart size={16} className="text-red-500 fill-current" />
          </div>
        )}
      </div>
      <div className="p-5 bg-white">
        <div className="flex gap-2 mb-2 flex-wrap">
          {CATEGORY_BADGES[categoryKey] && (
            <span
              className={`cat-badge flex items-center gap-1 ${CATEGORY_BADGES[categoryKey].color}`}
            >
              {CATEGORY_BADGES[categoryKey].icon}
              {CATEGORY_BADGES[categoryKey].label}
            </span>
          )}
          {product.in_stock && (
            <span className="cat-badge bg-kitty-green/30 text-green-700">
              <Check size={14} />В наявності
            </span>
          )}
        </div>
        <h3 className="font-display font-semibold text-xl mb-2">
          {product.name}
        </h3>
        <div className="relative group">
          <p className="text-neutral-600 mb-3 truncate">
            {product.description}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
        <div className="space-y-4">
          {weightOptions.length > 0 && (
            <WeightSelector
              category={product.animal_type as 'cat' | 'dog' | 'fish'}
              type={getWeightType(product.category)}
              value={selectedWeight}
              onChange={handleWeightChange}
              basePrice={product.price}
            />
          )}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">
              ${(product.price * priceMultiplier).toFixed(2)}
            </span>
            <button className="btn-primary py-2" onClick={handleAddToCart}>
              Додати в кошик
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
