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
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreWarehouses, setHasMoreWarehouses] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const loadWarehouses = async (cityRef: string, page: number = 1) => {
    try {
      setIsLoadingWarehouses(true);

      const response = await NovaPoshtaServices.getWarehouses(cityRef, page);

      if (response.success && response.data) {
        if (page === 1) {
          setWarehouses(response.data);
        } else {
          setWarehouses(prev => [...prev, ...response.data]);
        }
        setHasMoreWarehouses(response.data.length === 50);
      } else {
        console.error('Failed to load warehouses:', response);
        setError('Не вдалося завантажити список відділень');
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
      setError('Помилка при завантаженні відділень');
    } finally {
      setIsLoadingWarehouses(false);
    }
  };

  const loadMoreWarehouses = () => {
    if (!isLoadingWarehouses && hasMoreWarehouses && selectedCity) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadWarehouses(selectedCity, nextPage);
    }
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.Description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);
    setSelectedCity('');
    setSelectedWarehouse('');
  };

  const handleCityChange = async (value: string) => {
    setSelectedCity(value);
    setSelectedWarehouse('');
    setWarehouses([]);
    setCurrentPage(1);
    setHasMoreWarehouses(true);
    setOpen(false);
    await loadWarehouses(value);
  };

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
          <label className="block text-sm font-medium text-gray-700">
            Відділення
          </label>
          <input
            type="text"
            placeholder="Пошук відділення..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={selectedWarehouse}
            onChange={e => {
              setSelectedWarehouse(e.target.value);
              onSelect(selectedCity, e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoadingWarehouses}
          >
            <option value="">Виберіть відділення</option>
            {filteredWarehouses.map(warehouse => (
              <option key={warehouse.Ref} value={warehouse.Ref}>
                {warehouse.Description}
              </option>
            ))}
          </select>
          {hasMoreWarehouses && (
            <button
              onClick={loadMoreWarehouses}
              disabled={isLoadingWarehouses}
              className="w-full mt-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              {isLoadingWarehouses ? 'Завантаження...' : 'Завантажити більше'}
            </button>
          )}
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
