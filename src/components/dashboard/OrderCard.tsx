
import { Order } from '@/types/checkout';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getStatusDisplay, getOrderStatusIcon } from '@/utils/checkoutUtils';
import { CheckCircle, Clock, Package, PackageCheck, Truck, XCircle } from 'lucide-react';

const OrderCard = ({ order }: { order: Order }) => {
  const { label: statusLabel, color: statusColor } = getStatusDisplay(order.status);
  const { icon: StatusIcon, className: iconClass } = getOrderStatusIcon(order.status);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: uk });
  };
  
  const StatusIconComponent = () => {
    switch(StatusIcon) {
      case 'CheckCircle': return <CheckCircle className={iconClass} />;
      case 'Truck': return <Truck className={iconClass} />;
      case 'Package': return <Package className={iconClass} />;
      case 'PackageCheck': return <PackageCheck className={iconClass} />;
      case 'XCircle': return <XCircle className={iconClass} />;
      default: return <Clock className={iconClass} />;
    }
  };
  
  const getBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch(status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'awaiting_shipment': return 'outline';
      case 'shipped': return 'secondary';
      case 'delivered': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <div>
            <p className="text-sm font-medium">Замовлення №{order.id.substring(0, 8)}</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
          </div>
          <Badge variant={getBadgeVariant(order.status)} className="flex items-center gap-1">
            <StatusIconComponent />
            <span>{statusLabel}</span>
          </Badge>
        </div>
        <p className="font-medium">Загальна сума: {order.total_amount} грн</p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Доставка:</h4>
            <p className="text-sm">{order.shipping_address}, {order.shipping_city}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Контактна інформація:</h4>
            <p className="text-sm">{order.customer_name}, {order.customer_phone}</p>
            <p className="text-sm">{order.customer_email}</p>
          </div>
        </div>
      </div>
      
      {order.items && order.items.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="items">
            <AccordionTrigger className="px-4">Товари у замовленні</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.product_name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {item.price_at_time} грн
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.total_price} грн</p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default OrderCard;
