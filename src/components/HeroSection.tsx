
import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap } from 'gsap';

export const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 100, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    // Floating animation for the hero background
    gsap.to('.floating-element', {
      y: -20,
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    });

  }, []);

  const scrollToCustomization = () => {
    const customizeSection = document.getElementById('customize');
    if (customizeSection) {
      customizeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="floating-element absolute top-20 left-4 sm:left-10 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full opacity-20"></div>
        <div className="floating-element absolute top-32 sm:top-40 right-4 sm:right-20 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full opacity-15"></div>
        <div className="floating-element absolute bottom-32 sm:bottom-40 left-4 sm:left-20 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-600 rounded-full opacity-10"></div>
        <div className="floating-element absolute bottom-16 sm:bottom-20 right-4 sm:right-10 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full opacity-25"></div>
      </div>

      <div ref={heroRef} className="relative z-10 text-center w-full max-w-5xl mx-auto">
        <div ref={titleRef} className="mb-6 sm:mb-8 lg:mb-12">
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-tight sm:leading-tight">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-500 bg-clip-text text-transparent block">
              REDEFINE
            </span>
            <span className="text-white block">YOUR STYLE</span>
          </h1>
        </div>

        <div ref={subtitleRef} className="mb-8 sm:mb-10 lg:mb-12">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2">
            Experience professional uniform solutions like never before. Customize, create, and express your unique style with our cutting-edge 3D technology.
          </p>
        </div>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
          <button className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
            Explore Collection
          </button>
          <button 
            onClick={scrollToCustomization}
            className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-300"
          >
            Start Customizing
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
      </div>
    </section>
  );
};
