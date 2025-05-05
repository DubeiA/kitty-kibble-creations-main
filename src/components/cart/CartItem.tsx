import { CartItem as CartItemType } from '@/types/cart.ts';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-500">Кількість: {item.quantity}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
      </div>
    </div>
  );
};
