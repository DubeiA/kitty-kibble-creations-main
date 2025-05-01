import { ProductFilterType } from '@/types/product';

const categoryTitles = {
  all: 'All Pet Food Products',
  cat: 'Premium Cat Food Collection',
  dog: 'Quality Dog Food Selection',
  fish: 'Specialized Fish Food Products',
  dry: 'Dry Food Collection',
  wet: 'Premium Wet Food',
  treats: 'Special Treats & Rewards',
  subscription: 'Monthly Subscription Boxes',
};

const FILTERS = {
  cat: [
    { value: 'all', label: 'All Cat Food' },
    { value: 'kitten', label: 'Kitten' },
    { value: 'adult', label: 'Adult Cat' },
    { value: 'senior', label: 'Senior Cat' },
    { value: 'grain-free', label: 'Grain-Free' },
    { value: 'sensitive', label: 'Sensitive Digestion' },
    { value: 'high-protein', label: 'High-Protein Formula' },
  ],
  dog: [
    { value: 'all', label: 'All Dog Food' },
    { value: 'puppy', label: 'Puppy' },
    { value: 'adult', label: 'Adult Dog' },
    { value: 'senior', label: 'Senior Dog' },
    { value: 'grain-free', label: 'Grain-Free' },
    { value: 'sensitive', label: 'Sensitive Stomach' },
    { value: 'high-protein', label: 'High-Protein Formula' },
  ],
  fish: [
    { value: 'all', label: 'All Fish Food' },
    { value: 'fry', label: 'Fry' },
    { value: 'adult', label: 'Adult Fish' },
    { value: 'mature', label: 'Mature Fish' },
    { value: 'grain-free', label: 'Grain-Free (Low-Filler)' },
    { value: 'sensitive', label: 'For Sensitive Species' },
    { value: 'high-protein', label: 'High-Protein Feed' },
  ],
};

type ProductFiltersProps = {
  selectedCategory: string;
  activeFilter: ProductFilterType;
  onFilterChange: (filter: ProductFilterType) => void;
};

const ProductFilters = ({
  selectedCategory,
  activeFilter,
  onFilterChange,
}: ProductFiltersProps) => {
  return (
    <>
      <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4">
        {categoryTitles[selectedCategory as keyof typeof categoryTitles]}
      </h2>
      <p className="text-lg text-neutral-600 text-center max-w-2xl mx-auto mb-12">
        Відкрийте для себе їжу, яка робить домашніх тварин щасливими
      </p>

      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
        {FILTERS[selectedCategory as keyof typeof FILTERS]?.map(f => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value as ProductFilterType)}
            className={`px-4 py-2 rounded-full transition-all duration-300 text-sm md:text-base ${
              activeFilter === f.value
                ? 'bg-kitty-blue text-primary-foreground'
                : 'bg-white hover:bg-neutral-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default ProductFilters;
