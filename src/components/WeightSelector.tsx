import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WEIGHT_CONFIGS } from '@/constants/weightOptions';
import { WeightValue } from '@/types/weight';
import { formatPrice } from '@/lib/utils';

interface WeightSelectorProps {
  category: 'cat' | 'dog' | 'fish';
  type: 'dry' | 'wet';
  value: WeightValue;
  onChange: (weight: WeightValue, multiplier: number) => void;
  basePrice: number;
  className?: string;
}

export const WeightSelector = ({
  category,
  type,
  value,
  onChange,
  basePrice,
  className,
}: WeightSelectorProps) => {
  const key = `${category}${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const options = WEIGHT_CONFIGS[key]?.weights || [];

  // Якщо немає опцій або value не валідне, використовуємо першу опцію
  const currentValue =
    value && options.some(opt => opt.value === value)
      ? value
      : options[0]?.value;

  if (!options.length) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Select
        value={currentValue?.toString()}
        onValueChange={newValue => {
          const weight = options.find(opt => opt.value.toString() === newValue);
          if (weight) {
            onChange(weight.value, weight.priceMultiplier);
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Виберіть вагу" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label} - {formatPrice(basePrice * option.priceMultiplier)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
