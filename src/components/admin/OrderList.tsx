import { useState } from 'react';
import { Order, OrderItem } from '@/types/checkout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { getStatusDisplay, getOrderStatusIcon } from '@/utils/checkoutUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle,
  Clock,
  Package,
  PackageCheck,
  Truck,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderListProps {
  orders: Order[];
  loading: boolean;
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  handleDeleteOrder: (orderId: string) => void;
}

const formatWeight = (weight: number): string => {
  if (weight >= 1000) {
    return `${weight / 1000} кг`;
  }
  return `${weight} г`;
};

export function OrderList({
  orders,
  loading,
  onUpdateStatus,
  handleDeleteOrder,
}: OrderListProps) {
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>(
    {}
  );

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        <p>Завантаження замовлень...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return <div className="py-8 text-center">Немає замовлень</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: Order['status']) => {
    const { icon, className } = getOrderStatusIcon(status);
    switch (icon) {
      case 'CheckCircle':
        return <CheckCircle className={className} />;
      case 'Truck':
        return <Truck className={className} />;
      case 'Package':
        return <Package className={className} />;
      case 'PackageCheck':
        return <PackageCheck className={className} />;
      case 'XCircle':
        return <XCircle className={className} />;
      default:
        return <Clock className={className} />;
    }
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: Order['status']
  ) => {
    setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));
    await onUpdateStatus(orderId, newStatus);
    setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
  };

  return (
    <div className="space-y-8">
      {orders.map(order => (
        <div key={order.id} className="border rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">
                Замовлення #{order.id.substring(0, 8)}...
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.created_at)}
              </p>
              {order.customer_name && (
                <p className="text-sm">
                  Клієнт: {order.customer_name} ({order.customer_email})
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <Badge
                variant={
                  order.status === 'delivered'
                    ? 'default'
                    : order.status === 'cancelled'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                <span className="capitalize font-medium">
                  {getStatusDisplay(order.status).label}
                </span>
              </Badge>
            </div>
          </div>

          <div className="border-t border-b py-4 my-4">
            <p className="font-medium">Товари:</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Назва</TableHead>
                    <TableHead>Кількість</TableHead>
                    <TableHead>Вага</TableHead>
                    <TableHead>Ціна</TableHead>
                    <TableHead>Підсумок</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items &&
                    order.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {formatWeight(item.selected_weight)}
                        </TableCell>
                        <TableCell>
                          {item.price_at_time.toFixed(2)} грн
                        </TableCell>
                        <TableCell>{item.total_price.toFixed(2)} грн</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-right mt-4">
              <p className="font-bold">
                Загальна сума: {order.total_amount} грн
              </p>
            </div>
          </div>

          {order.shipping_address && (
            <div className="mb-4">
              <p className="font-medium">Адреса доставки:</p>
              <p>
                {order.shipping_address}, {order.shipping_city}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              className="mr-auto"
              variant="destructive"
              onClick={() => handleDeleteOrder(order.id)}
            >
              Видалити
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={updatingOrders[order.id]}>
                  {updatingOrders[order.id] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Оновлення...
                    </>
                  ) : (
                    'Змінити статус'
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(order.id, 'pending')}
                >
                  <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                  Очікує обробки
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(order.id, 'processing')}
                >
                  <Package className="mr-2 h-4 w-4 text-blue-500" />В обробці
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleStatusUpdate(order.id, 'awaiting_shipment')
                  }
                >
                  <PackageCheck className="mr-2 h-4 w-4 text-orange-500" />
                  Очікує відправлення
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(order.id, 'shipped')}
                >
                  <Truck className="mr-2 h-4 w-4 text-purple-500" />
                  Відправлено
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Доставлено
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                >
                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                  Скасовано
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
