import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useScrollToSection } from '@/hooks/useScrollToSection';

const faqs = [
  {
    question: 'How quickly will my order ship?',
    answer:
      "We ship all orders within 24 hours on business days. Your cat's food will arrive in 2-5 business days, depending on your location. For subscriptions, we make sure to ship well before you run out!",
  },
  {
    question: 'Can I change flavors in my subscription?',
    answer:
      'Absolutely! We know cats can be picky. You can change flavors, pause, or adjust your subscription at any time from your account. Our goal is to find what makes your cat purr with delight!',
  },
  {
    question: "What if my cat doesn't like the food?",
    answer:
      "We're confident your cat will love our recipes, but if not, we offer a 100% satisfaction guarantee. If your cat turns up their nose, contact us within 30 days for a full refund or to try a different recipe.",
  },
  {
    question: 'Are your products made in the USA?',
    answer:
      'Yes! All of our products are proudly made in the USA with globally-sourced ingredients that meet our strict quality standards. We work with trusted suppliers who share our values for quality and safety.',
  },
  {
    question: 'How do I know which food is right for my cat?',
    answer:
      "We recommend food based on your cat's age, weight, and specific dietary needs. If you're unsure, try our 'Cat Food Finder' quiz or contact our team of cat nutrition experts who can help you make the perfect choice!",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const scrollToSection = useScrollToSection();

  return (
    <section id="faq" className="py-16 px-4 md:px-8 bg-neutral-100">
      <div className="container mx-auto max-w-3xl">
        <h2 className="section-title text-center">
          Frequently Asked Questions
        </h2>
        <p className="section-subtitle text-center">
          Everything you need to know about our cat food (as if the cats were
          answering!)
        </p>

        <div className="mt-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                className="w-full text-left p-5 flex items-center justify-between font-medium"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-display text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <Minus size={18} className="text-primary-foreground" />
                ) : (
                  <Plus size={18} />
                )}
              </button>

              {openIndex === index && (
                <div className="p-5 pt-0 text-neutral-600 animated-fade-in">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-neutral-600">Still have questions?</p>
          <button
            className="btn-primary inline-block"
            onClick={() => scrollToSection('contact')}
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
