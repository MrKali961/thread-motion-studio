
import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, Float } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ClothingModel = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[1, 1.5, 0.3]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <mesh position={[position[0], position[1] - 0.8, position[2]]} rotation={rotation}>
        <cylinderGeometry args={[0.3, 0.5, 1]} />
        <meshStandardMaterial color="#B8860B" />
      </mesh>
    </Float>
  );
};

export const ShowcaseSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo('.showcase-item',
        { opacity: 0, scale: 0.8, y: 100 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.showcase-grid',
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const showcaseItems = [
    { title: "Premium Jackets", description: "Crafted with the finest materials", color: "#FFD700" },
    { title: "Designer Shirts", description: "Elegant and comfortable", color: "#FF6B6B" },
    { title: "Luxury Pants", description: "Perfect fit, premium quality", color: "#4ECDC4" },
    { title: "Exclusive Dresses", description: "Timeless elegance", color: "#45B7D1" },
  ];

  return (
    <section id="collection" ref={sectionRef} className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              3D SHOWCASE
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Immerse yourself in our collection with interactive 3D models that bring our designs to life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 showcase-grid">
          {showcaseItems.map((item, index) => (
            <div key={index} className="showcase-item bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700">
              <div className="h-80 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} />
                  <ClothingModel 
                    position={[0, 0, 0]} 
                    rotation={[0, index * 0.5, 0]} 
                  />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                </Canvas>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-300 mb-4">{item.description}</p>
              <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
