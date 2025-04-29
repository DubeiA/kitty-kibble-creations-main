
import { useState } from 'react';
import { Cat, Dog, Fish, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategorySelector = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    navigate(`/shop?category=${category}`);
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className={`p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              activeCategory === 'all' ? 'bg-kitty-pink/20 border-2 border-kitty-pink' : 'bg-white hover:bg-kitty-pink/10'
            }`}
            onClick={() => handleCategoryChange('all')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-kitty-pink/20 rounded-full">
                <PawPrint size={32} className="text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">All Products</h3>
            </div>
          </div>

          <div 
            className={`p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              activeCategory === 'cat' ? 'bg-kitty-pink/20 border-2 border-kitty-pink' : 'bg-white hover:bg-kitty-pink/10'
            }`}
            onClick={() => handleCategoryChange('cat')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-kitty-pink/20 rounded-full">
                <Cat size={32} className="text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">Cat Food</h3>
            </div>
          </div>

          <div 
            className={`p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              activeCategory === 'dog' ? 'bg-kitty-pink/20 border-2 border-kitty-pink' : 'bg-white hover:bg-kitty-pink/10'
            }`}
            onClick={() => handleCategoryChange('dog')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-kitty-pink/20 rounded-full">
                <Dog size={32} className="text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">Dog Food</h3>
            </div>
          </div>

          <div 
            className={`p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
              activeCategory === 'fish' ? 'bg-kitty-pink/20 border-2 border-kitty-pink' : 'bg-white hover:bg-kitty-pink/10'
            }`}
            onClick={() => handleCategoryChange('fish')}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-kitty-pink/20 rounded-full">
                <Fish size={32} className="text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">Fish Food</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
