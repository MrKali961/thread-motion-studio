
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
    // Clean up any existing animations
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
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
