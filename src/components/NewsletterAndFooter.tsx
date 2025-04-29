
import { PawPrint } from 'lucide-react';

const NewsletterAndFooter = () => {
  return (
    <footer className="bg-neutral-800 text-white">
      {/* Newsletter Section */}
      <div id="contact" className="py-16 px-4 md:px-8">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="section-title">Get Early Mews & Special Treats</h2>
          <p className="text-neutral-300 mb-8">
            Subscribe to our newsletter for exclusive offers, cat care tips, and first access to new products!
          </p>
          
          <div className="flex flex-col md:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-5 py-3 rounded-full text-neutral-800 focus:outline-none focus:ring-2 focus:ring-kitty-pink"
            />
            <button className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </div>
          
          <p className="text-xs text-neutral-400 mt-3">
            By subscribing, you agree to receive marketing emails. You can unsubscribe anytime.
          </p>
        </div>
      </div>
      
      {/* Footer Content */}
      <div className="border-t border-neutral-700 py-12 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo and About */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-kitty-pink p-2 rounded-full">
                  <PawPrint size={20} className="text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl">Kitty Kibble</span>
              </div>
              <p className="text-neutral-300 text-sm">
                Made with love for the felines who bring joy to our lives.
              </p>
            </div>
            
            {/* Shop Links */}
            <div>
              <h3 className="font-display font-semibold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">All Products</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Dry Food</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Wet Food</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Treats</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Subscription Box</a></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h3 className="font-display font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Ingredients</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Reviews</a></li>
                <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Social Links */}
            <div>
              <h3 className="font-display font-semibold mb-4">Connect</h3>
              <div className="flex gap-4 mb-4">
                <a href="#" className="bg-neutral-700 hover:bg-neutral-600 p-2 rounded-full transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2H8C5.79086 2 4 3.79086 4 6V18C4 20.2091 5.79086 22 8 22H16C18.2091 22 20 20.2091 20 18V8L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="bg-neutral-700 hover:bg-neutral-600 p-2 rounded-full transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 11.3701C16.1234 12.2023 15.9812 13.0523 15.5937 13.7991C15.2062 14.5459 14.5932 15.1515 13.8416 15.5297C13.0901 15.9079 12.2385 16.0397 11.4078 15.906C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1903 8.22773 13.4229 8.09406 12.5923C7.9604 11.7616 8.09226 10.91 8.47044 10.1584C8.84862 9.40691 9.45419 8.7938 10.201 8.4063C10.9478 8.0188 11.7978 7.87665 12.63 8.00006C13.4789 8.12594 14.2649 8.52152 14.8717 9.12836C15.4785 9.73521 15.8741 10.5211 16 11.3701Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.5 6.5H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="bg-neutral-700 hover:bg-neutral-600 p-2 rounded-full transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="bg-neutral-700 hover:bg-neutral-600 p-2 rounded-full transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
              <p className="text-sm text-neutral-400">
                See our cats eat on Instagram & TikTok!
              </p>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-neutral-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-neutral-400">
              © 2025 Kitty Kibble Creations. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex gap-4 text-sm text-neutral-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewsletterAndFooter;
