
import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mesh } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CustomClothing = ({ color, size, pattern }: { color: string, size: number, pattern: string }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  const getPatternTexture = () => {
    switch (pattern) {
      case 'stripes':
        return { roughness: 0.8, metalness: 0.1 };
      case 'dots':
        return { roughness: 0.3, metalness: 0.7 };
      default:
        return { roughness: 0.5, metalness: 0.2 };
    }
  };

  return (
    <mesh ref={meshRef} scale={[size, size, size]}>
      <boxGeometry args={[2, 2.5, 0.5]} />
      <meshStandardMaterial 
        color={color} 
        {...getPatternTexture()}
      />
    </mesh>
  );
};

export const CustomizationSection = () => {
  const [color, setColor] = useState('#FFD700');
  const [size, setSize] = useState(1);
  const [pattern, setPattern] = useState('solid');
  const sectionRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: 'Gold', value: '#FFD700' },
    { name: 'Silver', value: '#C0C0C0' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#00FF00' },
  ];

  const patterns = ['solid', 'stripes', 'dots'];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.customization-title',
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

      gsap.fromTo('.control-panel',
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo('.canvas-container',
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.5,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="customize" ref={sectionRef} className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="customization-title text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              CUSTOMIZE
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Design your perfect piece with our real-time 3D customization tool
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="control-panel space-y-8">
            <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Color Selection</h3>
              <div className="grid grid-cols-3 gap-4">
                {colors.map((colorOption) => (
                  <button
                    key={colorOption.name}
                    onClick={() => setColor(colorOption.value)}
                    className={`w-16 h-16 rounded-full border-4 transition-all duration-300 ${
                      color === colorOption.value ? 'border-yellow-500 scale-110' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                  >
                    <span className="sr-only">{colorOption.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Size</h3>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-gray-300 mt-2">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Pattern</h3>
              <div className="grid grid-cols-3 gap-4">
                {patterns.map((patternOption) => (
                  <button
                    key={patternOption}
                    onClick={() => setPattern(patternOption)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      pattern === patternOption
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {patternOption.charAt(0).toUpperCase() + patternOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
              Add to Cart - $299
            </button>
          </div>

          <div className="canvas-container">
            <div className="h-96 lg:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <CustomClothing color={color} size={size} pattern={pattern} />
                <OrbitControls enableZoom={true} />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
