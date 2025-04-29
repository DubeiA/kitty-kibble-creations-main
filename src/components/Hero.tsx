import { Cat, PawPrint } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=1200&auto=format&fit=crop",
    title: "Natural ingredients.",
    subtitle: "Happy cats.",
    description: "Made with love using only natural ingredients. Because your feline friend deserves nothing but the best."
  },
  {
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=1200&auto=format&fit=crop",
    title: "Limited Time!",
    subtitle: "20% OFF",
    description: "Get an exclusive 20% discount on all premium cat food products. Valid until end of month!"
  },
  {
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=1200&auto=format&fit=crop",
    title: "Subscribe & Save",
    subtitle: "Monthly boxes",
    description: "Get 15% off and free shipping with our monthly subscription. Plus, a free toy in every third box!"
  }
];

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-kitty-pink/30 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <Carousel className="w-full">
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <PawPrintAnimation />
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
                      {slide.title} <br />
                      <span className="text-primary-foreground">{slide.subtitle}</span>
                    </h1>
                    <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto md:mx-0">
                      {slide.description}
                    </p>
                    <button className="btn-primary text-lg">
                      Find your cat's favorite
                      <Cat size={20} />
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-5 -left-5 w-24 h-24 bg-kitty-yellow rounded-full opacity-60 animate-float"></div>
                    <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-kitty-blue rounded-full opacity-60 animate-float" style={{ animationDelay: '1s' }}></div>
                    <img
                      src={slide.image}
                      alt="Happy cat with food"
                      className="rounded-3xl shadow-lg relative z-10 w-full h-auto object-cover max-h-[500px]"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

// Paw Print Animation Component
const PawPrintAnimation = () => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="paw-container animate-paw-print">
          <div className="bg-kitty-pink/80 p-1 rounded-full">
            <PawPrint size={16} className="text-primary-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Hero;
