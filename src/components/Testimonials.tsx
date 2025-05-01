import { useState, useEffect, useCallback } from 'react';
import { Heart, Cat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    catName: 'Whiskers',
    ownerName: 'Emily',
    message:
      'Whiskers finally eats everything in the bowl! He literally jumps with excitement at mealtime now.',
    image:
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=92&auto=format&fit=crop',
  },
  {
    id: 2,
    catName: 'Luna',
    ownerName: 'Michael',
    message:
      'My picky eater Luna absolutely loves the Salmon Sensation. Her coat looks healthier than ever!',
    image:
      'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?q=80&w=92&auto=format&fit=crop',
  },
  {
    id: 3,
    catName: 'Oliver',
    ownerName: 'Sarah',
    message:
      'Oliver has more energy and less digestive issues since switching to these recipes. Thank you!',
    image:
      'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?q=80&w=92&auto=format&fit=crop',
  },
  {
    id: 4,
    catName: 'Simba',
    ownerName: 'David',
    message:
      'The subscription box is so convenient and Simba gets excited when he sees the delivery arrive!',
    image:
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=92&auto=format&fit=crop',
  },
  {
    id: 5,
    catName: 'Milo',
    ownerName: 'Jessica',
    message:
      'Milo is 12 years old and the Senior Vitality formula has given him a new lease on life!',
    image:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=92&auto=format&fit=crop',
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev

  const changeTestimonial = useCallback(
    (newIndex: number) => {
      if (isTransitioning) return;
      setDirection(
        newIndex > activeIndex ||
          (activeIndex === testimonials.length - 1 && newIndex === 0)
          ? 1
          : -1
      );
      setIsTransitioning(true);
      setActiveIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, activeIndex]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        changeTestimonial((activeIndex + 1) % testimonials.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, isTransitioning, changeTestimonial]);

  const visibleTestimonials = (() => {
    if (window.innerWidth >= 768) {
      // For desktop, show 3 testimonials
      const prev =
        activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
      const next = (activeIndex + 1) % testimonials.length;
      return [
        testimonials[prev],
        testimonials[activeIndex],
        testimonials[next],
      ];
    }
    // For mobile, show only the active testimonial
    return [testimonials[activeIndex]];
  })();

  return (
    <section id="reviews" className="py-16 px-4 md:px-8 bg-kitty-peach/20">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Happy Cats, Happy Parents</h2>
        <p className="section-subtitle text-center">
          Here's what our furry customers (and their humans) have to say
        </p>

        <div className="relative max-w-4xl mx-auto">
          {/* Desktop Testimonial Display */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, idx) => (
              <motion.div
                key={`${testimonial.id}-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: idx === 1 ? 1.1 : 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className={`bg-white p-6 rounded-2xl shadow-sm transition-all duration-500 ${idx === 1 ? 'z-10' : 'opacity-80'}`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-3">
                    <img
                      loading="lazy"
                      src={testimonial.image}
                      alt={testimonial.catName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">
                      {testimonial.catName}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      & {testimonial.ownerName}
                    </p>
                  </div>
                </div>
                <p className="text-neutral-600">{testimonial.message}</p>
                <div className="mt-4 flex items-center text-primary-foreground">
                  <Heart size={16} className="mr-2 fill-current" />
                  <span className="text-sm">Verified Customer</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Testimonial Display */}
          <div className="md:hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: direction > 0 ? 30 : -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction > 0 ? -30 : 30 }}
                transition={{ duration: 0.4 }}
                className="bg-white p-6 rounded-2xl shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden mr-3">
                    <img
                      loading="lazy"
                      src={testimonials[activeIndex].image}
                      alt={testimonials[activeIndex].catName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">
                      {testimonials[activeIndex].catName}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      & {testimonials[activeIndex].ownerName}
                    </p>
                  </div>
                </div>
                <p className="text-neutral-600">
                  {testimonials[activeIndex].message}
                </p>
                <div className="mt-4 flex items-center text-primary-foreground">
                  <Heart size={16} className="mr-2 fill-current" />
                  <span className="text-sm">Verified Customer</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-4 gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => changeTestimonial(idx)}
                  className={`w-3 h-3 rounded-full transition-colors ${activeIndex === idx ? 'bg-kitty-pink' : 'bg-neutral-300'}`}
                  disabled={isTransitioning}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows (Desktop) */}
          <div className="hidden md:block">
            <button
              onClick={() =>
                changeTestimonial(
                  activeIndex > 0 ? activeIndex - 1 : testimonials.length - 1
                )
              }
              className="absolute top-1/2 -left-10 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-md hover:bg-neutral-100 disabled:opacity-50"
              disabled={isTransitioning}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-left"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={() =>
                changeTestimonial((activeIndex + 1) % testimonials.length)
              }
              className="absolute top-1/2 -right-10 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-md hover:bg-neutral-100 disabled:opacity-50"
              disabled={isTransitioning}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
        <div></div>

        <div className="flex flex-col items-start mt-10">
          <h3 className="text-2xl font-display font-semibold mb-4">
            Over 50,000 happy cats can't be wrong!
          </h3>
          <Link to="/shop" className="btn-primary mt-2 ">
            Shop Now
            <Cat size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
