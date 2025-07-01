
import { useEffect, useRef } from 'react';
import { ArrowUp, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { gsap } from 'gsap';

export const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo('.footer-content',
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="footer-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                LOCK UNIFORMS
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Professional uniform solutions with cutting-edge technology and timeless design.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all duration-300">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all duration-300">
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Shop</h4>
              <ul className="space-y-2">
                {['New Arrivals', 'Jackets', 'Shirts', 'Pants', 'Dresses', 'Accessories'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Careers', 'Press', 'Sustainability', 'Privacy', 'Terms'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                {['Help Center', 'Size Guide', 'Shipping', 'Returns', 'Contact Us', 'FAQ'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-yellow-500 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 The Elites Solutions. All rights reserved. Crafted with passion.
            </p>
            <button
              onClick={scrollToTop}
              className="mt-4 md:mt-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-all duration-300 transform hover:scale-110"
            >
              <ArrowUp className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
