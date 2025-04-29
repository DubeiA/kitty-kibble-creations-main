
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
}

export function AdminHeader({ onRefresh, onLogout }: AdminHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-medium">Список замовлень</h2>
      <div className="space-x-2">
        <Button onClick={onRefresh} variant="outline">Оновити</Button>
        <Button onClick={onLogout} variant="outline">Вийти</Button>
      </div>
    </div>
  );
}
