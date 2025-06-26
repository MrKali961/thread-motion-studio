
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

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="floating-element absolute top-20 left-10 w-4 h-4 bg-yellow-500 rounded-full opacity-20"></div>
        <div className="floating-element absolute top-40 right-20 w-6 h-6 bg-yellow-400 rounded-full opacity-15"></div>
        <div className="floating-element absolute bottom-40 left-20 w-8 h-8 bg-yellow-600 rounded-full opacity-10"></div>
        <div className="floating-element absolute bottom-20 right-10 w-3 h-3 bg-yellow-500 rounded-full opacity-25"></div>
      </div>

      <div ref={heroRef} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div ref={titleRef} className="mb-6">
          <h1 className="text-6xl md:text-8xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-yellow-500 bg-clip-text text-transparent">
              REDEFINE
            </span>
            <br />
            <span className="text-white">YOUR STYLE</span>
          </h1>
        </div>

        <div ref={subtitleRef} className="mb-8">
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Experience luxury fashion like never before. Customize, create, and express your unique style with our cutting-edge 3D technology.
          </p>
        </div>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
            Explore Collection
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-black transition-all duration-300">
            Start Customizing
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-8 h-8 text-yellow-500" />
      </div>
    </section>
  );
};
