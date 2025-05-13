import { WeightValue } from './weight';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedWeight: number;
  category: string;
  type: string;
}
