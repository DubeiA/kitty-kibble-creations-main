import React from 'react';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const { items, removeFromCart, updateQuantity } = useCartStore();
  const { toast } = useToast();

  const handleRemoveFromCart = (id: string, selectedWeight: number) => {
    removeFromCart(id, selectedWeight);
    toast({
      title: 'Товар видалено',
      description: 'Товар було видалено з кошика',
    });
  };

  const handleUpdateQuantity = (
    id: string,
    newQuantity: number,
    selectedWeight: number
  ) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity, selectedWeight);
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${weight / 1000} кг`;
    }
    return `${weight} г`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Кошик</h1>
      {items.length === 0 ? (
        <p className="text-center text-gray-500">Кошик порожній</p>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div
              key={`${item.id}-${item.selectedWeight}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    Вага: {formatWeight(item.selectedWeight)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ціна: ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleUpdateQuantity(
                      item.id,
                      item.quantity - 1,
                      item.selectedWeight
                    )
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleUpdateQuantity(
                      item.id,
                      item.quantity + 1,
                      item.selectedWeight
                    )
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
              </div>
              <button
                onClick={() =>
                  handleRemoveFromCart(item.id, item.selectedWeight)
                }
                className="text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <div className="mt-6 text-right">
            <p className="text-xl font-bold">
              Загальна сума: $
              {items
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
