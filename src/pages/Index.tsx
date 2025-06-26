
import { useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ShowcaseSection } from '../components/ShowcaseSection';
import { CustomizationSection } from '../components/CustomizationSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  useEffect(() => {
    // Initialize GSAP animations
    gsap.fromTo('.fade-in', 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.fade-in',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Smooth scrolling
    gsap.to(window, {
      scrollTo: { autoKill: false },
      ease: "power2.inOut"
    });
  }, []);

  return (
    <div className="bg-black text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <ShowcaseSection />
      <CustomizationSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
