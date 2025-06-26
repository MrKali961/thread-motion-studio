
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { gsap } from 'gsap';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo('.nav-item', 
      { opacity: 0, y: -20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8,
        stagger: 0.1,
        delay: 0.5
      }
    );
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      gsap.fromTo('.mobile-menu-item',
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.3,
          stagger: 0.1 
        }
      );
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="nav-item">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              LUXE
            </h1>
          </div>

          <div className="hidden md:flex space-x-8">
            {['Home', 'Collection', 'Customize', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="nav-item text-white hover:text-yellow-500 transition-colors duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ShoppingBag className="nav-item w-6 h-6 text-white hover:text-yellow-500 cursor-pointer transition-colors" />
            <button className="nav-item bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-2 rounded-full hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300">
              Shop Now
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-black/95 backdrop-blur-md">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {['Home', 'Collection', 'Customize', 'About', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="mobile-menu-item block px-3 py-2 text-white hover:text-yellow-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
