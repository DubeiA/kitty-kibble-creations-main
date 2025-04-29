
import { Check, Heart, LeafyGreen, PawPrint } from 'lucide-react';
import Box from './icons/Box';

const features = [
  {
    icon: <LeafyGreen size={36} />,
    color: "bg-kitty-green/20",
    title: "Natural Ingredients",
    description: "Only the freshest, highest-quality ingredients make it into our recipes. No fillers, no artificial flavors."
  },
  {
    icon: <Check size={36} />,
    color: "bg-kitty-blue/20",
    title: "Vet-Approved Recipes",
    description: "Our formulas are developed with veterinary nutritionists to ensure optimal feline health."
  },
  {
    icon: <PawPrint size={36} />,
    color: "bg-kitty-yellow/20",
    title: "Cat-Tested Taste",
    description: "Our recipes are tested and approved by our own panel of feline taste-testers."
  },
  {
    icon: <Heart size={36} />,
    color: "bg-kitty-pink/20",
    title: "Supporting Cat Rescue",
    description: "For every subscription box, we donate a meal to shelter cats looking for their forever home."
  }
];

const WhyOurFood = () => {
  return (
    <section id="why-our-food" className="py-16 px-4 md:px-8">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Why Our Food?</h2>
        <p className="section-subtitle text-center">
          We go beyond ordinary cat food to create meals that nourish and delight
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className={`${feature.color} p-4 rounded-2xl inline-block mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">{feature.title}</h3>
              <p className="text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-kitty-peach/20 p-8 rounded-3xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-display font-semibold mb-2">Try our Subscription Box</h3>
              <p className="text-neutral-600 mb-4 md:mb-0">
                Regular deliveries with a surprise toy in every 3rd box!
              </p>
            </div>
            <button className="btn-primary">
              Build Your Purrfect Plan
              <Box size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyOurFood;
