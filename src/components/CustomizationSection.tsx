import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Center } from '@react-three/drei';
import { Mesh, TextureLoader, Group, MeshStandardMaterial, CanvasTexture, Material } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Helper function to create composite texture with logo
const createCompositeTexture = (
  baseColor: string,
  logoImage: HTMLImageElement | null,
  logoSize: number,
  logoPosition: { x: number, y: number }
): CanvasTexture => {
  console.log('Creating composite texture:', { baseColor, hasLogo: !!logoImage, logoSize, logoPosition });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Set canvas size (power of 2 for better GPU performance)
  canvas.width = 512;
  canvas.height = 512;
  
  // Fill with base color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add logo if provided
  if (logoImage && logoImage.complete) {
    console.log('Drawing logo on canvas...');
    ctx.save();
    
    // Convert position from -0.8 to 0.8 range to canvas coordinates
    const x = ((logoPosition.x + 0.8) / 1.6) * canvas.width;
    const y = ((0.8 - logoPosition.y) / 1.6) * canvas.height; // Flip Y axis
    
    // Calculate logo size in pixels (make it more visible)
    const logoPixelSize = Math.max(logoSize * 150, 50); // Minimum 50px, scale up
    
    // Center the logo at the position
    const logoX = x - logoPixelSize / 2;
    const logoY = y - logoPixelSize / 2;
    
    // Draw logo with alpha blending
    ctx.globalAlpha = 0.9;
    ctx.drawImage(logoImage, logoX, logoY, logoPixelSize, logoPixelSize);
    
    console.log('Logo drawn at:', { logoX, logoY, logoPixelSize });
    ctx.restore();
  } else if (logoImage) {
    console.log('Logo image not ready yet, waiting for load...');
  }
  
  // Add a visible test pattern if no logo
  if (!logoImage) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100);
    console.log('Added test pattern to canvas');
  }
  
  // Create and return Three.js texture
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.flipY = false; // Important for correct orientation
  
  console.log('Texture created successfully');
  return texture;
};

const CustomClothing = ({ modelPath, color, size, pattern, logo, logoSize, logoPosition }: {
  modelPath: string,
  color: string,
  size: number,
  pattern: string,
  logo: string | null,
  logoSize: number,
  logoPosition: { x: number, y: number }
}) => {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef<Group>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [originalMaterial, setOriginalMaterial] = useState<Material | null>(null);

  // Load logo image
  useEffect(() => {
    if (logo) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setLogoImage(img);
      img.src = logo;
    } else {
      setLogoImage(null);
    }
  }, [logo]);

  // Apply material modifications
  useEffect(() => {
    if (!meshRef.current) return;

    const clonedScene = scene.clone();
    let materialFound = false;
    
    console.log('=== DEBUGGING MATERIAL TRAVERSAL ===');
    
    // Traverse the scene to find and modify materials
    clonedScene.traverse((child) => {
      if (child instanceof Mesh && child.material) {
        console.log('Found mesh:', child.name, 'Material:', child.material);
        
        // Log all material names for debugging
        if (Array.isArray(child.material)) {
          console.log('Material array:', child.material.map(mat => ({ name: mat.name, type: mat.type })));
          
          // Check each material in the array
          child.material.forEach((mat, index) => {
            if (mat.name === 'Image_0.004' || mat.name.includes('Image')) {
              console.log('Found target material:', mat.name, 'at index:', index);
              materialFound = true;
              
              // Create composite texture
              const compositeTexture = createCompositeTexture(color, logoImage, logoSize, logoPosition);
              
              // Create new material
              const newMaterial = new MeshStandardMaterial({
                map: compositeTexture,
                transparent: true,
                alphaTest: 0.1,
                name: mat.name // Preserve the name
              });
              
              // Replace the material
              child.material[index] = newMaterial;
              console.log('Applied new material with composite texture');
            }
          });
        } else {
          console.log('Single material:', { name: child.material.name, type: child.material.type });
          
          // Check single material
          if (child.material.name === 'Image_0.004' || child.material.name.includes('Image') || !child.material.name) {
            console.log('Found target material:', child.material.name || 'unnamed');
            materialFound = true;
            
            // Create composite texture
            const compositeTexture = createCompositeTexture(color, logoImage, logoSize, logoPosition);
            
            // Create new material
            const newMaterial = new MeshStandardMaterial({
              map: compositeTexture,
              transparent: true,
              alphaTest: 0.1,
              name: child.material.name // Preserve the name
            });
            
            // Replace the material
            child.material = newMaterial;
            console.log('Applied new material with composite texture');
          }
        }
      }
    });
    
    console.log('Material found:', materialFound);
    console.log('Logo image loaded:', !!logoImage);
    console.log('=== END DEBUGGING ===');

    // Replace the scene content
    if (meshRef.current.children.length > 0) {
      meshRef.current.remove(meshRef.current.children[0]);
    }
    meshRef.current.add(clonedScene);
    
  }, [scene, color, logoImage, logoSize, logoPosition]);

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <Center>
        <group ref={meshRef} scale={[size, size, size]} />
      </Center>
    </Float>
  );
};

// Logo placement templates
const logoTemplates = [
  { 
    name: 'Center Chest', 
    position: { x: 0, y: 0.2 }, 
    size: 0.6,
    description: 'Classic center chest placement'
  },
  { 
    name: 'Left Chest', 
    position: { x: -0.3, y: 0.3 }, 
    size: 0.4,
    description: 'Professional left chest logo'
  },
  { 
    name: 'Right Chest', 
    position: { x: 0.3, y: 0.3 }, 
    size: 0.4,
    description: 'Right chest placement'
  },
  { 
    name: 'Large Center', 
    position: { x: 0, y: 0 }, 
    size: 0.8,
    description: 'Large prominent center logo'
  },
  { 
    name: 'Small Center', 
    position: { x: 0, y: 0.1 }, 
    size: 0.3,
    description: 'Subtle center placement'
  },
  { 
    name: 'Lower Center', 
    position: { x: 0, y: -0.2 }, 
    size: 0.5,
    description: 'Lower chest area'
  }
];

export const CustomizationSection = () => {
  const [selectedModel, setSelectedModel] = useState('/opt-high_visibilty_vest_1.glb');
  const color = '#FFD700'; // Default gold color
  const [size, setSize] = useState(0.5);
  const [pattern, setPattern] = useState('solid');
  const [logo, setLogo] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(0); // Default to first template
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get current logo settings from selected template
  const currentTemplate = logoTemplates[selectedTemplate];
  const logoSize = currentTemplate.size;
  const logoPosition = currentTemplate.position;

  const availableModels = [
    { name: 'High Visibility Vest', path: '/opt-high_visibilty_vest_1.glb' }
  ];


  const patterns = ['solid', 'stripes', 'dots'];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

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
    <section id="customize" ref={sectionRef} className="py-20 bg-black">
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
              <h3 className="text-2xl font-bold text-white mb-6">Model Selection</h3>
              <div className="grid grid-cols-2 gap-4">
                {availableModels.map((model) => (
                  <button
                    key={model.path}
                    onClick={() => setSelectedModel(model.path)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      selectedModel === model.path
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>




            <div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Logo Placement</h3>
              <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="text-sm text-gray-300 mb-2">Current Template:</div>
                <div className="text-lg font-semibold text-yellow-400">{currentTemplate.name}</div>
                <div className="text-sm text-gray-400 mt-1">{currentTemplate.description}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Size: {Math.round(currentTemplate.size * 100)}% • 
                  Position: {currentTemplate.position.x > 0 ? 'Right' : currentTemplate.position.x < 0 ? 'Left' : 'Center'} {currentTemplate.position.y > 0 ? 'Upper' : currentTemplate.position.y < 0 ? 'Lower' : 'Middle'}
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-white mb-4">Upload Logo</h4>
              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center hover:bg-gray-600 transition-colors"
                  >
                    {logo ? 'Change Logo' : 'Upload Logo'}
                  </label>
                </div>

                {logo && (
                  <>
                    <div className="flex items-center justify-between">
                      <img src={logo} alt="Logo preview" className="w-12 h-12 object-contain bg-white rounded" />
                      <button
                        onClick={removeLogo}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-4">Logo Placement Templates</label>
                      <div className="grid grid-cols-1 gap-3">
                        {logoTemplates.map((template, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedTemplate(index)}
                            className={`p-4 rounded-lg text-left transition-all duration-300 ${
                              selectedTemplate === index
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            }`}
                          >
                            <div className="font-semibold text-lg">{template.name}</div>
                            <div className={`text-sm mt-1 ${
                              selectedTemplate === index ? 'text-black/70' : 'text-gray-300'
                            }`}>
                              {template.description}
                            </div>
                            <div className={`text-xs mt-2 ${
                              selectedTemplate === index ? 'text-black/60' : 'text-gray-400'
                            }`}>
                              Size: {Math.round(template.size * 100)}% • Position: {template.position.x > 0 ? 'Right' : template.position.x < 0 ? 'Left' : 'Center'} {template.position.y > 0 ? 'Upper' : template.position.y < 0 ? 'Lower' : 'Middle'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105">
              Make it Reality
            </button>
          </div>

          <div className="canvas-container">
            <div className="h-96 lg:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <CustomClothing modelPath={selectedModel} color={color} size={size} pattern={pattern} logo={logo} logoSize={logoSize} logoPosition={logoPosition} />
                <OrbitControls enableZoom={false} enablePan={false} makeDefault />
              </Canvas>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
