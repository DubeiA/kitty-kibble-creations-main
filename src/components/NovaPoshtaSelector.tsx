import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { NovaPoshtaServices } from '@/services/novaPoshtaService';
import { Loader2 } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface City {
  Description: string;
  Ref: string;
  AreaDescription: string;
}

interface Warehouse {
  Description: string;
  Ref: string;
}

interface NovaPoshtaSelectorProps {
  onSelect: (city: string, warehouse: string) => void;
  className?: string;
}

export const NovaPoshtaSelector: React.FC<NovaPoshtaSelectorProps> = ({
  onSelect,
  className = '',
}) => {
  const [areas, setAreas] = useState<City[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Завантажуємо області при першому рендері
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await NovaPoshtaServices.getCities();
        if (response.success) {
          setAreas(response.data);
        } else {
          setError('Не вдалося завантажити список областей');
        }
      } catch (err) {
        setError('Помилка при завантаженні областей');
        console.error('Error fetching areas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  // Завантажуємо міста при зміні області
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedArea) {
        setCities([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await NovaPoshtaServices.getCities(selectedArea);
        if (response.success) {
          setCities(response.data);
        } else {
          setError('Не вдалося завантажити список міст');
        }
      } catch (err) {
        setError('Помилка при завантаженні міст');
        console.error('Error fetching cities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [selectedArea]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!selectedCity) {
        setWarehouses([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await NovaPoshtaServices.getWarehouses(selectedCity);
        if (response.success) {
          setWarehouses(response.data);
        } else {
          setError('Не вдалося завантажити список відділень');
        }
      } catch (err) {
        setError('Помилка при завантаженні відділень');
        console.error('Error fetching warehouses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [selectedCity]);

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
    setSelectedCity('');
    setSelectedWarehouse('');
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedWarehouse('');
    setOpen(false);
  };

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value);
    onSelect(selectedCity, value);
  };

  const selectedAreaName =
    areas.find(area => area.Ref === selectedArea)?.Description || '';
  const selectedCityName =
    cities.find(city => city.Ref === selectedCity)?.Description || '';

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="area">Область</Label>
        <Select
          value={selectedArea}
          onValueChange={handleAreaChange}
          disabled={loading}
        >
          <SelectTrigger id="area">
            <SelectValue placeholder="Виберіть область" />
          </SelectTrigger>
          <SelectContent>
            {areas.map(area => (
              <SelectItem key={area.Ref} value={area.Ref}>
                {area.Description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Місто</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={loading || !selectedArea}
            >
              {selectedCityName || 'Виберіть місто'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Пошук міста..." />
              <CommandList>
                <CommandEmpty>Місто не знайдено</CommandEmpty>
                {cities.map(city => (
                  <CommandItem
                    key={city.Ref}
                    value={city.Description}
                    onSelect={() => handleCityChange(city.Ref)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCity === city.Ref ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {city.Description}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {selectedCity && (
        <div className="space-y-2">
          <Label htmlFor="warehouse">Відділення</Label>
          <Select
            value={selectedWarehouse}
            onValueChange={handleWarehouseChange}
            disabled={loading}
          >
            <SelectTrigger id="warehouse">
              <SelectValue placeholder="Виберіть відділення" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map(warehouse => (
                <SelectItem key={warehouse.Ref} value={warehouse.Ref}>
                  {warehouse.Description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Завантаження...</span>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};
