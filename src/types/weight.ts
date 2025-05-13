export type WeightValue =
  | 20
  | 50
  | 85
  | 100
  | 250
  | 400
  | 500
  | 800
  | 1000
  | 1500
  | 2000
  | 3000
  | 4000
  | 5000
  | 7000
  | 7500
  | 8000
  | 9000
  | 10000
  | 12500
  | 15000
  | 20000;

export interface WeightOption {
  value: WeightValue;
  label: string;
  priceMultiplier: number;
}

export interface ProductWeight {
  baseWeight: WeightValue;
  options: WeightOption[];
}

export type ProductCategory = 'cat' | 'dog' | 'fish';
export type ProductType = 'dry' | 'wet';

export interface WeightConfig {
  category: ProductCategory;
  type: ProductType;
  weights: WeightOption[];
}
