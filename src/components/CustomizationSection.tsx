import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Center } from '@react-three/drei';
import { Mesh, TextureLoader, Group, MeshStandardMaterial, CanvasTexture, Material } from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Custom CSS for sliders (inject into head)
const sliderStyles = `
  input[type="range"].slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  input[type="range"].slider::-webkit-slider-track {
    background: #4b5563;
    height: 8px;
    border-radius: 4px;
  }

  input[type="range"].slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: #eab308;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 2px solid #fbbf24;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  input[type="range"].slider::-moz-range-track {
    background: #4b5563;
    height: 8px;
    border-radius: 4px;
    border: none;
  }

  input[type="range"].slider::-moz-range-thumb {
    background: #eab308;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    border: 2px solid #fbbf24;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

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
  
  // Set high-resolution canvas size (power of 2 for better GPU performance)
  canvas.width = 1024;
  canvas.height = 1024;
  
  // Create gradient base for brighter, more vibrant appearance
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, adjustBrightness(baseColor, 0.2));
  gradient.addColorStop(0.5, baseColor);
  gradient.addColorStop(1, adjustBrightness(baseColor, 0.1));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle fabric texture
  addFabricTexture(ctx, canvas.width, canvas.height);
  
  // Add logo if provided
  if (logoImage && logoImage.complete) {
    console.log('Drawing logo on canvas...');
    ctx.save();
    
    // Convert position from -0.8 to 0.8 range to canvas coordinates
    // Adjust for vest-specific positioning
    const x = ((logoPosition.x + 0.8) / 1.6) * canvas.width;
    const y = ((0.8 - logoPosition.y) / 1.6) * canvas.height; // Flip Y axis
    
    // Calculate logo size in pixels with better scaling
    const baseLogoSize = Math.max(logoSize * 200, 80); // Increased base size
    const logoPixelSize = Math.min(baseLogoSize, canvas.width * 0.4); // Cap at 40% of canvas
    
    // Center the logo at the position
    const logoX = x - logoPixelSize / 2;
    const logoY = y - logoPixelSize / 2;
    
    // Add subtle shadow behind logo for depth
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Create circular or rounded rectangle background for logo
    const padding = 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, logoX - padding, logoY - padding, logoPixelSize + padding * 2, logoPixelSize + padding * 2, 8);
    ctx.fill();
    
    ctx.restore();
    
    // Draw logo with better blending
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.85;
    ctx.drawImage(logoImage, logoX, logoY, logoPixelSize, logoPixelSize);
    
    // Add slight embossed effect
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.2;
    ctx.drawImage(logoImage, logoX + 1, logoY + 1, logoPixelSize, logoPixelSize);
    
    console.log('Logo drawn at:', { logoX, logoY, logoPixelSize });
    ctx.restore();
  } else if (logoImage) {
    console.log('Logo image not ready yet, waiting for load...');
  }
  
  // Create and return Three.js texture
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.flipY = false; // Important for correct orientation
  texture.wrapS = texture.wrapT = 1000; // RepeatWrapping
  texture.generateMipmaps = true;
  
  console.log('Enhanced texture created successfully');
  return texture;
};

// Helper function to adjust color brightness
const adjustBrightness = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount * 255));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount * 255));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount * 255));
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

// Helper function to add fabric texture
const addFabricTexture = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Add subtle noise for fabric texture
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 20;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
};

// Helper function to draw rounded rectangle
const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
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
    let materialsProcessed = 0;
    
    console.log('=== DEBUGGING MATERIAL TRAVERSAL ===');
    
    // Traverse the scene to find and modify materials
    clonedScene.traverse((child) => {
      if (child instanceof Mesh && child.material) {
        console.log('Found mesh:', child.name || 'unnamed', 'Type:', child.type);
        
        // Handle material arrays
        if (Array.isArray(child.material)) {
          console.log('Material array with', child.material.length, 'materials:');
          child.material.forEach((mat, index) => {
            console.log(`  [${index}] Name: "${mat.name || 'unnamed'}", Type: ${mat.type}`);
          });
          
          // Apply texture to all materials or find the main fabric material
          child.material.forEach((mat, index) => {
            // Enhanced material matching logic
            const shouldApplyTexture = (
              !mat.name || // Unnamed materials
              mat.name.includes('Image') ||
              mat.name.includes('Material') ||
              mat.name.includes('Fabric') ||
              mat.name.includes('Cloth') ||
              mat.name.includes('Vest') ||
              mat.name.toLowerCase().includes('main') ||
              index === 0 // First material as fallback
            );
            
            if (shouldApplyTexture) {
              console.log('Applying texture to material:', mat.name || `unnamed[${index}]`);
              materialFound = true;
              materialsProcessed++;
              
              // Create composite texture
              const compositeTexture = createCompositeTexture(color, logoImage, logoSize, logoPosition);
              
              // Create enhanced material with brighter appearance
              const newMaterial = new MeshStandardMaterial({
                map: compositeTexture,
                transparent: true,
                alphaTest: 0.1,
                roughness: mat.roughness || 0.6,
                metalness: mat.metalness || 0.05,
                emissive: 0x111111,
                emissiveIntensity: 0.1,
                name: mat.name || `customized_material_${index}`
              });
              
              // Replace the material
              child.material[index] = newMaterial;
              console.log('Applied composite texture to material at index:', index);
            }
          });
        } else {
          // Handle single material
          console.log('Single material - Name:', child.material.name || 'unnamed', 'Type:', child.material.type);
          
          // Enhanced single material matching
          const mat = child.material;
          const shouldApplyTexture = (
            !mat.name || // Unnamed materials
            mat.name.includes('Image') ||
            mat.name.includes('Material') ||
            mat.name.includes('Fabric') ||
            mat.name.includes('Cloth') ||
            mat.name.includes('Vest') ||
            mat.name.toLowerCase().includes('main') ||
            mat.type === 'MeshStandardMaterial' // Default to standard materials
          );
          
          if (shouldApplyTexture) {
            console.log('Applying texture to single material:', mat.name || 'unnamed');
            materialFound = true;
            materialsProcessed++;
            
            // Create composite texture
            const compositeTexture = createCompositeTexture(color, logoImage, logoSize, logoPosition);
            
            // Create enhanced material with brighter appearance
            const newMaterial = new MeshStandardMaterial({
              map: compositeTexture,
              transparent: true,
              alphaTest: 0.1,
              roughness: mat.roughness || 0.6,
              metalness: mat.metalness || 0.05,
              emissive: 0x111111,
              emissiveIntensity: 0.1,
              name: mat.name || 'customized_material'
            });
            
            // Replace the material
            child.material = newMaterial;
            console.log('Applied composite texture to single material');
          }
        }
      }
    });
    
    console.log('=== MATERIAL PROCESSING COMPLETE ===');
    console.log('Materials found and processed:', materialsProcessed);
    console.log('At least one material modified:', materialFound);
    console.log('Logo image loaded:', !!logoImage);
    console.log('Color:', color);
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

// Logo placement templates - updated for vest constraints with custom first
const logoTemplates = [
  {
    name: 'Custom Position',
    position: { x: 0, y: 0.3 },
    size: 0.4,
    description: 'Position and scale your logo exactly where you want it'
  },
  { 
    name: 'Left Chest', 
    position: { x: -0.35, y: 0.4 }, 
    size: 0.35,
    description: 'Professional left chest logo - classic safety vest placement'
  },
  { 
    name: 'Right Chest', 
    position: { x: 0.35, y: 0.4 }, 
    size: 0.35,
    description: 'Right chest placement - ideal for company logos'
  },
  { 
    name: 'Large Back', 
    position: { x: 0, y: 0.1 }, 
    size: 0.7,
    description: 'Large back placement - maximum visibility for company branding'
  },
  { 
    name: 'Lower Left', 
    position: { x: -0.4, y: -0.1 }, 
    size: 0.3,
    description: 'Lower left pocket area'
  },
  { 
    name: 'Lower Right', 
    position: { x: 0.4, y: -0.1 }, 
    size: 0.3,
    description: 'Lower right pocket area'
  }
];

export const CustomizationSection = () => {
  const [selectedModel, setSelectedModel] = useState('/opt-high_visibilty_vest_1.glb');
  const [color, setColor] = useState('#FFD700'); // Default gold color - now as state
  const [size, setSize] = useState(0.5);
  const [pattern, setPattern] = useState('solid');
  const [logo, setLogo] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(0); // Default to first template
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  
  // Custom positioning state
  const [customPosition, setCustomPosition] = useState({ x: 0, y: 0.3 });
  const [customSize, setCustomSize] = useState(0.4);
  
  const sectionRef = useRef<HTMLDivElement>(null);

  // Get current logo settings from selected template or custom values
  const isCustomTemplate = selectedTemplate === 0; // Custom template is now first (index 0)
  const currentTemplate = logoTemplates[selectedTemplate];
  const logoSize = isCustomTemplate ? customSize : currentTemplate.size;
  const logoPosition = isCustomTemplate ? customPosition : currentTemplate.position;

  const availableModels = [
    { name: 'High Visibility Vest', path: '/opt-high_visibilty_vest_1.glb' }
  ];


  const patterns = ['solid', 'stripes', 'dots'];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setLogoError(null);
    setIsLogoLoading(true);

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setLogoError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      setIsLogoLoading(false);
      return;
    }

    // File size validation (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setLogoError('File size must be less than 5MB');
      setIsLogoLoading(false);
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Create an image to validate dimensions
      const img = new Image();
      img.onload = () => {
        // Check minimum dimensions
        if (img.width < 50 || img.height < 50) {
          setLogoError('Image must be at least 50x50 pixels');
          setIsLogoLoading(false);
          return;
        }
        
        // Check maximum dimensions
        if (img.width > 2048 || img.height > 2048) {
          setLogoError('Image must be no larger than 2048x2048 pixels');
          setIsLogoLoading(false);
          return;
        }
        
        // Success - set the logo
        setLogo(result);
        setIsLogoLoading(false);
        console.log('Logo uploaded successfully:', { 
          width: img.width, 
          height: img.height, 
          size: file.size,
          type: file.type 
        });
      };
      
      img.onerror = () => {
        setLogoError('Failed to load image. Please try a different file.');
        setIsLogoLoading(false);
      };
      
      img.src = result;
    };
    
    reader.onerror = () => {
      setLogoError('Failed to read file. Please try again.');
      setIsLogoLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoError(null);
    // Clear the file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Inject custom slider styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = sliderStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
              <h3 className="text-2xl font-bold text-white mb-6">Color Customization</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-3">Vest Color</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-16 h-16 border-2 border-gray-600 rounded-lg cursor-pointer bg-transparent"
                      title="Choose vest color"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-gray-300 mb-1">Selected Color</div>
                      <div className="text-lg font-mono text-white bg-gray-700 px-3 py-2 rounded border border-gray-600">
                        {color.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-3">Quick Colors</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { name: 'High-Vis Yellow', color: '#FFD700' },
                      { name: 'Safety Orange', color: '#FF6B35' },
                      { name: 'Lime Green', color: '#32CD32' },
                      { name: 'Electric Blue', color: '#1E90FF' },
                      { name: 'Hot Pink', color: '#FF1493' },
                      { name: 'Purple', color: '#9932CC' },
                      { name: 'Red', color: '#DC143C' },
                      { name: 'Black', color: '#1F1F1F' }
                    ].map((presetColor) => (
                      <button
                        key={presetColor.name}
                        onClick={() => setColor(presetColor.color)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                          color === presetColor.color ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: presetColor.color }}
                        title={presetColor.name}
                      />
                    ))}
                  </div>
                </div>
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
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    disabled={isLogoLoading}
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`cursor-pointer block w-full px-4 py-3 border rounded-lg text-center transition-colors ${
                      isLogoLoading 
                        ? 'bg-gray-800 border-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                    }`}
                  >
                    {isLogoLoading ? 'Processing...' : logo ? 'Change Logo' : 'Upload Logo'}
                  </label>
                </div>

                {/* Error Message */}
                {logoError && (
                  <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">⚠️</span>
                      <span className="text-red-300 text-sm">{logoError}</span>
                    </div>
                  </div>
                )}

                {/* File Requirements */}
                <div className="text-xs text-gray-400 bg-gray-700/30 p-3 rounded-lg">
                  <div className="font-semibold text-gray-300 mb-1">Requirements:</div>
                  <ul className="space-y-1">
                    <li>• Formats: JPEG, PNG, GIF, WebP</li>
                    <li>• Size: 50x50 to 2048x2048 pixels</li>
                    <li>• Max file size: 5MB</li>
                  </ul>
                </div>

                {logo && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                      <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo preview" className="w-12 h-12 object-contain bg-white rounded" />
                        <div className="text-sm">
                          <div className="text-white font-medium">Logo uploaded</div>
                          <div className="text-gray-400">Ready for placement</div>
                        </div>
                      </div>
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
                          <div key={index}>
                            <button
                              onClick={() => setSelectedTemplate(index)}
                              className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
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
                            
                            {/* Custom positioning controls - appears directly under Custom Position button */}
                            {isCustomTemplate && index === 0 && (
                              <div className="mt-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                                <h5 className="text-lg font-semibold text-yellow-400 mb-4">Custom Logo Controls</h5>
                                
                                <div className="space-y-4">
                                  {/* Logo Size Control */}
                                  <div>
                                    <label className="block text-white font-medium mb-2">
                                      Logo Size: {Math.round(customSize * 100)}%
                                    </label>
                                    <input
                                      type="range"
                                      min="0.1"
                                      max="0.8"
                                      step="0.05"
                                      value={customSize}
                                      onChange={(e) => setCustomSize(parseFloat(e.target.value))}
                                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                      <span>10%</span>
                                      <span>80%</span>
                                    </div>
                                  </div>

                                  {/* Horizontal Position Control */}
                                  <div>
                                    <label className="block text-white font-medium mb-2">
                                      Horizontal Position: {customPosition.x > 0 ? 'Right' : customPosition.x < 0 ? 'Left' : 'Center'}
                                    </label>
                                    <input
                                      type="range"
                                      min="-0.6"
                                      max="0.6"
                                      step="0.05"
                                      value={customPosition.x}
                                      onChange={(e) => setCustomPosition({...customPosition, x: parseFloat(e.target.value)})}
                                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                      <span>Left</span>
                                      <span>Center</span>
                                      <span>Right</span>
                                    </div>
                                  </div>

                                  {/* Vertical Position Control */}
                                  <div>
                                    <label className="block text-white font-medium mb-2">
                                      Vertical Position: {customPosition.y > 0.3 ? 'Upper' : customPosition.y < -0.1 ? 'Lower' : 'Middle'}
                                    </label>
                                    <input
                                      type="range"
                                      min="-0.3"
                                      max="0.7"
                                      step="0.05"
                                      value={customPosition.y}
                                      onChange={(e) => setCustomPosition({...customPosition, y: parseFloat(e.target.value)})}
                                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                      <span>Lower</span>
                                      <span>Middle</span>
                                      <span>Upper</span>
                                    </div>
                                  </div>

                                  {/* Quick Reset Button */}
                                  <button
                                    onClick={() => {
                                      setCustomPosition({ x: 0, y: 0.3 });
                                      setCustomSize(0.4);
                                    }}
                                    className="w-full px-4 py-2 bg-yellow-600 text-black rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium"
                                  >
                                    Reset to Default Position
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
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
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <pointLight position={[-10, -10, -10]} intensity={0.8} />
                <pointLight position={[0, 10, 5]} intensity={0.7} color="#ffffff" />
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
