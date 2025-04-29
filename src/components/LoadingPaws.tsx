
import { PawPrint } from 'lucide-react';

const LoadingPaws = () => {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex items-center gap-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i}
            className="paw-container animate-paw-print"
            style={{ 
              animationDelay: `${i * 0.2}s`,
            }}
          >
            <div className="bg-kitty-pink/80 p-3 rounded-full">
              <PawPrint size={24} className="text-primary-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingPaws;
