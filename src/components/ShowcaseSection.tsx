
import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Text, Float, Center } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ClothingModel = ({ modelPath, position, rotation }: { modelPath: string, position: [number, number, number], rotation: [number, number, number] }) => {
  const { scene } = useGLTF(modelPath);
  
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Center position={position} rotation={rotation}>
        <primitive object={scene.clone()} scale={[1.5, 1.5, 1.5]} />
      </Center>
    </Float>
  );
};

export const ShowcaseSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
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

      // Individual showcase items animations
      gsap.utils.toArray('.showcase-row').forEach((row: Element, index) => {
        const isEven = index % 2 === 0;
        
        // Animate the 3D canvas
        gsap.fromTo(row.querySelector('.model-canvas'),
          { 
            opacity: 0,
            x: isEven ? -100 : 100,
            scale: 0.8
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 75%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Animate the content
        gsap.fromTo(row.querySelector('.model-content'),
          { 
            opacity: 0,
            x: isEven ? 100 : -100,
            y: 30
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 1,
            delay: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 75%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Animate the decorative elements
        gsap.fromTo(row.querySelector('.decorative-line'),
          { 
            scaleX: 0,
            opacity: 0
          },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.8,
            delay: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: row,
              start: "top 70%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const showcaseItems = [
    { 
      title: "Restaurant Cook Outfit", 
      description: "Professional chef attire designed for comfort and functionality in demanding kitchen environments.",
      modelPath: "/opt-psx_prop_-_restaurant_cook.glb"
    },
    { 
      title: "Gregory Street Outfit", 
      description: "Modern street style that combines comfort with contemporary urban fashion trends.",
      modelPath: "/opt-gregory_street_outfit.glb"
    },
    { 
      title: "Pete's Collection", 
      description: "Versatile casual wear that adapts to any situation while maintaining a refined aesthetic.",
      modelPath: "/opt-pete.glb"
    },
    { 
      title: "Business Suit", 
      description: "Professional formal wear crafted for the modern businessman who demands excellence.",
      modelPath: "/opt-indian_man_with_suit.glb"
    },
    { 
      title: "Sports Wear", 
      description: "Athletic apparel engineered for performance with cutting-edge fabric technology.",
      modelPath: "/opt-man_player.glb"
    },
  ];

  return (
    <section id="collection" ref={sectionRef} className="py-20 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              3D SHOWCASE
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Immerse yourself in our collection with interactive 3D models that bring our designs to life
          </p>
        </div>

        <div className="space-y-32">
          {showcaseItems.map((item, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <div key={index} className={`showcase-row flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}>
                {/* 3D Model Canvas */}
                <div className="model-canvas w-full lg:w-1/2">
                  <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-2xl">
                    <div className="h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <ambientLight intensity={0.4} />
                        <pointLight position={[10, 10, 10]} intensity={1.2} />
                        <pointLight position={[-10, -10, -10]} intensity={0.6} />
                        <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.3} />
                        <ClothingModel 
                          modelPath={item.modelPath}
                          position={[0, 0, 0]} 
                          rotation={[0, index * 0.5, 0]}
                        />
                        <OrbitControls 
                          enableZoom={false} 
                          enablePan={false}
                          makeDefault
                        />
                      </Canvas>
                    </div>
                    
                    {/* Decorative corner elements */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-yellow-500/30"></div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-yellow-500/30"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="model-content w-full lg:w-1/2">
                  <div className="relative">
                    {/* Decorative line */}
                    <div className="decorative-line absolute -top-8 left-0 w-20 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 origin-left"></div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                          {item.title}
                        </h3>
                      </div>
                      
                      <p className="text-lg text-gray-300 leading-relaxed mb-8">
                        {item.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
                          View Details
                        </button>
                      </div>
                    </div>
                    
                    {/* Background decorative element */}
                    <div className="absolute -z-10 -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
