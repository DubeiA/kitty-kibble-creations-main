import { WeightConfig, WeightValue } from '@/types/weight';

const formatWeightLabel = (weight: WeightValue): string => {
  if (weight >= 1000) {
    return `${weight / 1000} кг`;
  }
  return `${weight} г`;
};

const createWeightOption = (value: WeightValue, priceMultiplier: number) => ({
  value,
  label: formatWeightLabel(value),
  priceMultiplier,
});

export const WEIGHT_CONFIGS: Record<string, WeightConfig> = {
  catDry: {
    category: 'cat',
    type: 'dry',
    weights: [
      createWeightOption(400, 1),
      createWeightOption(1500, 1.2),
      createWeightOption(2000, 1.3),
      createWeightOption(4000, 1.4),
      createWeightOption(10000, 1.5),
    ],
  },
  catWet: {
    category: 'cat',
    type: 'wet',
    weights: [
      createWeightOption(85, 1),
      createWeightOption(100, 1.1),
      createWeightOption(400, 1.2),
    ],
  },
  dogDry: {
    category: 'dog',
    type: 'dry',
    weights: [
      createWeightOption(500, 1),
      createWeightOption(1000, 1.2),
      createWeightOption(2000, 1.3),
      createWeightOption(3000, 1.4),
      createWeightOption(4000, 1.5),
      createWeightOption(7500, 1.6),
      createWeightOption(10000, 1.7),
      createWeightOption(15000, 1.8),
      createWeightOption(20000, 1.9),
    ],
  },
  dogWet: {
    category: 'dog',
    type: 'wet',
    weights: [createWeightOption(400, 1), createWeightOption(800, 1.2)],
  },
  fishDry: {
    category: 'fish',
    type: 'dry',
    weights: [
      createWeightOption(20, 1),
      createWeightOption(50, 1.1),
      createWeightOption(100, 1.2),
      createWeightOption(250, 1.3),
      createWeightOption(500, 1.4),
      createWeightOption(1000, 1.5),
    ],
  },
  fishWet: {
    category: 'fish',
    type: 'wet',
    weights: [
      createWeightOption(20, 1),
      createWeightOption(50, 1.1),
      createWeightOption(100, 1.2),
      createWeightOption(250, 1.3),
    ],
  },
  fishFlakes: {
    category: 'fish',
    type: 'dry',
    weights: [
      createWeightOption(20, 1),
      createWeightOption(50, 1.1),
      createWeightOption(100, 1.2),
    ],
  },
  fishGranules: {
    category: 'fish',
    type: 'dry',
    weights: [
      createWeightOption(20, 1),
      createWeightOption(50, 1.1),
      createWeightOption(100, 1.2),
      createWeightOption(250, 1.3),
    ],
  },
  fishSticks: {
    category: 'fish',
    type: 'dry',
    weights: [
      createWeightOption(20, 1),
      createWeightOption(50, 1.1),
      createWeightOption(100, 1.2),
    ],
  },
  fishChips: {
    category: 'fish',
    type: 'dry',
    weights: [
      createWeightOption(20, 1),
      createWeightOption(50, 1.1),
      createWeightOption(100, 1.2),
    ],
  },
  fishTablets: {
    category: 'fish',
    type: 'dry',
    weights: [
      createWeightOption(20, 1),
      createWeightOption(50, 1.1),
      createWeightOption(100, 1.2),
    ],
  },
};
