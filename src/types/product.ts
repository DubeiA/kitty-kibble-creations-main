export type ProductFilterType =
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

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  animal_type: string;
  life_stage?: string;
  category?: string;
};
