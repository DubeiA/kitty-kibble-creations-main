import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export const CheckoutItemsList = () => {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeFromCart = useCartStore(state => state.removeFromCart);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6 text-primary-foreground text-center md:text-left">
        Ваше замовлення
      </h2>
      {!items || items.length === 0 ? (
        <div className="text-center py-8 text-lg text-gray-500">
          Кошик порожній
        </div>
      ) : (
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
          {items.map(item => (
            <div
              key={`${item.id}-${item.selectedWeight}`}
              className="flex flex-col p-4 border rounded-lg bg-neutral-50 hover:shadow-md transition min-h-[120px]"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div className="flex flex-col items-start w-full">
                  <h3 className="font-semibold text-base">{item.name}</h3>
                  <p className="text-xs text-gray-500">
                    Ціна: {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1,
                          item.selectedWeight
                        )
                      }
                      className="h-7 w-7"
                    >
                      -
                    </Button>
                    <span className="font-semibold text-base w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1,
                          item.selectedWeight
                        )
                      }
                      className="h-7 w-7"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center w-full mt-2">
                <p className="font-semibold text-base text-primary-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => removeFromCart(item.id, item.selectedWeight)}
                  className="h-7 w-7"
                  title="Видалити"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
