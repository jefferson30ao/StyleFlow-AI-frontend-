import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GarmentIcon } from '../components/GarmentIcon';
import { 
  Crown, 
  RefreshCw, 
  Sliders, 
  Zap, 
  Camera, 
  Upload, 
  Plus, 
  AlertCircle, 
  Trash2, 
  Sparkles
} from 'lucide-react';
import type { Garment } from '../types';
import { api } from '../services/api';

// Import generated avatar models
import valeriaModel from '../assets/valeria_model.png';
import maleModel from '../assets/male_model.png';
import curvyModel from '../assets/curvy_model.png';

// Highly robust crossOrigin image loader using Blob fetching
const loadImage = async (url: string): Promise<HTMLImageElement> => {
  try {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => rej(new Error("Fallo al cargar imagen inline."));
        img.src = url;
      });
    }

    // Fetch the image as a blob to prevent tainted canvas on S3 / external URLs
    const response = await fetch(url);
    const blob = await response.blob();
    const localUrl = URL.createObjectURL(blob);
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(localUrl);
        res(img);
      };
      img.onerror = () => rej(new Error("Fallo al procesar blob de imagen."));
      img.src = localUrl;
    });
  } catch (error) {
    console.warn("Fallo en descarga directa de imagen, usando fallback crossOrigin", error);
    return new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("Error de CORS al cargar imagen."));
      img.src = url;
    });
  }
};


export const MirrorMode: React.FC = () => {
  const { user, closet, fetchCloset, uploadGarmentFile, confirmGarment, setActiveTab } = useApp();
  
  // Mirror Mode is only available in 'elite' plan
  const isLocked = !user || user.plan !== 'elite';

  const tops = closet.filter(c => c.category === 'tops');
  const bottoms = closet.filter(c => c.category === 'bottoms');

  const [selectedTop, setSelectedTop] = useState<Garment | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<Garment | null>(null);

  // Set initial selections when closet loads
  useEffect(() => {
    if (tops.length > 0 && !selectedTop) {
      setSelectedTop(tops[0]);
    }
    if (bottoms.length > 0 && !selectedBottom) {
      setSelectedBottom(bottoms[0]);
    }
  }, [closet]);

  // Requesty API Key from environment variable
  const apiKey = import.meta.env.VITE_REQUESTY_API_KEY || localStorage.getItem('sf_requesty_api_key') || '';

  // Default Avatars list
  const defaultAvatars = [
    { id: 'a1', name: 'Valeria (Modelo Base)', gender: 'female', height: '1.68m', imageUrl: valeriaModel },
    { id: 'a2', name: 'Avatar Masculino', gender: 'male', height: '1.80m', imageUrl: maleModel },
    { id: 'a3', name: 'Avatar Curvy', gender: 'female', height: '1.65m', imageUrl: curvyModel }
  ];

  // Custom Avatar state
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem('sf_custom_avatar_url') || null;
  });

  // Active avatar state
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => {
    const savedCustom = localStorage.getItem('sf_custom_avatar_url');
    return savedCustom ? 'custom' : 'a1';
  });

  // Get active avatar details
  const getActiveAvatarUrl = () => {
    if (selectedAvatarId === 'custom' && customAvatarUrl) {
      return customAvatarUrl;
    }
    const baseAvatar = defaultAvatars.find(a => a.id === selectedAvatarId);
    return baseAvatar ? baseAvatar.imageUrl : valeriaModel;
  };

  // Adjustments sliders
  const [fit, setFit] = useState(50); // tight vs oversized
  const [lighting, setLighting] = useState(70); // daylight vs studio
  
  // Render process states
  const [renderStep, setRenderStep] = useState<'idle' | 'rendering' | 'ready'>('idle');
  const [renderProgressMsg, setRenderProgressMsg] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Camera references & state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Garment upload input references
  const topUploadInputRef = useRef<HTMLInputElement | null>(null);
  const bottomUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [garmentUploadProgress, setGarmentUploadProgress] = useState<'idle' | 'uploading' | 'classifying' | 'done'>('idle');
  const [garmentUploadError, setGarmentUploadError] = useState<string | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Custom Avatar file upload handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCustomAvatarUrl(dataUrl);
        localStorage.setItem('sf_custom_avatar_url', dataUrl);
        setSelectedAvatarId('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Camera handler
  const startCamera = async () => {
    setRenderError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 720, height: 720 }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setRenderError("No se pudo acceder a la cámara. Por favor, concede permisos en tu navegador.");
    }
  };

  // Stop Camera handler
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Capture photo from camera stream
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame to the canvas
        ctx.drawImage(videoRef.current, 0, 0, 720, 720);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
        setCustomAvatarUrl(dataUrl);
        localStorage.setItem('sf_custom_avatar_url', dataUrl);
        setSelectedAvatarId('custom');
      }
      stopCamera();
    }
  };

  // Delete custom avatar handler
  const handleDeleteCustomAvatar = () => {
    setCustomAvatarUrl(null);
    localStorage.removeItem('sf_custom_avatar_url');
    if (selectedAvatarId === 'custom') {
      setSelectedAvatarId('a1');
    }
  };

  // Upload and auto-confirm a new garment
  const handleGarmentUpload = async (e: React.ChangeEvent<HTMLInputElement>, categoryHint: 'tops' | 'bottoms') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGarmentUploadError(null);
    setGarmentUploadProgress('uploading');
    try {
      const res = await uploadGarmentFile(file);
      setGarmentUploadProgress('classifying');
      
      const category = res.classification?.category || (categoryHint === 'tops' ? 'top' : 'bottom');
      const subcategory = res.classification?.subcategory || 'Prenda nueva';
      const primaryColor = res.classification?.primaryColor || '#a78bfa';
      
      const success = await confirmGarment({
        imageKey: res.imageKey,
        category,
        subcategory,
        primaryColor,
        secondaryColors: res.classification?.secondaryColors || [],
        style: res.classification?.style || 'casual',
        season: res.classification?.season || ['todo el año'],
        material: res.classification?.material || 'algodón',
        aiConfidence: res.classification?.confidence || 0.9
      });
      
      if (success) {
        await fetchCloset();
        setGarmentUploadProgress('done');
        
        // Auto select the new garment
        setTimeout(async () => {
          const updatedCloset = await api.garments.list();
          const newGarment = updatedCloset[0];
          if (newGarment) {
            if (newGarment.category === 'tops') {
              setSelectedTop(newGarment);
            } else if (newGarment.category === 'bottoms') {
              setSelectedBottom(newGarment);
            }
          }
          setGarmentUploadProgress('idle');
        }, 300);
      } else {
        setGarmentUploadError('Fallo al confirmar la prenda.');
        setGarmentUploadProgress('idle');
      }
    } catch (err: any) {
      console.error(err);
      setGarmentUploadError(err.message || 'Error en la subida de la prenda.');
      setGarmentUploadProgress('idle');
    }
  };

  // Canvas Image Merging helper
  const mergeImages = async (avatarUrl: string, garmentUrls: string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto 2D del canvas."));
        return;
      }

      // Fill canvas background with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 1024);

      // Load all images in parallel using the shared loadImage function
      Promise.all([loadImage(avatarUrl), ...garmentUrls.map(url => loadImage(url))])
        .then(([avatarImg, ...garmentImgs]) => {
          // Helper to draw aspect-ratio fitted image in a target bounding box
          const drawFit = (img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) => {
            const imgRatio = img.width / img.height;
            const targetRatio = dw / dh;
            let w = dw;
            let h = dh;
            let x = dx;
            let y = dy;

            if (imgRatio > targetRatio) {
              h = dw / imgRatio;
              y = dy + (dh - h) / 2;
            } else {
              w = dh * imgRatio;
              x = dx + (dw - w) / 2;
            }
            ctx.drawImage(img, x, y, w, h);
          };

          // Draw avatar on left half (0, 0, 512, 1024)
          drawFit(avatarImg, 0, 0, 512, 1024);

          // Draw clothes stacked vertically on right half (512, 0, 512, 1024)
          const numClothes = garmentImgs.length;
          if (numClothes > 0) {
            const boxH = 1024 / numClothes;
            garmentImgs.forEach((gImg, idx) => {
              const gy = idx * boxH;
              drawFit(gImg, 512, gy, 512, boxH);
              
              // Draw divider line between items
              if (idx > 0) {
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(512, gy);
                ctx.lineTo(1024, gy);
                ctx.stroke();
              }
            });
          }

          // Draw thick divider line between avatar and clothing items
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(512, 0);
          ctx.lineTo(512, 1024);
          ctx.stroke();

          resolve(canvas.toDataURL('image/jpeg', 0.85));
        })
        .catch(reject);
    });
  };

  // Perform virtual try-on via Requesty AI
  const handleStartRender = async () => {
    if (!apiKey) {
      setRenderError("Por favor, introduce tu API Key de Requesty para continuar.");
      return;
    }
    if (!selectedTop && !selectedBottom) {
      setRenderError("Debes seleccionar al menos una prenda para el probador virtual.");
      return;
    }

    setRenderError(null);
    setRenderStep('rendering');
    setRenderProgressMsg("Fusionando imágenes de avatar y armario...");

    try {
      // 1. Gather all selected garment URLs
      const garmentUrls: string[] = [];
      if (selectedTop?.imageUrl) garmentUrls.push(selectedTop.imageUrl);
      if (selectedBottom?.imageUrl) garmentUrls.push(selectedBottom.imageUrl);

      const avatarUrl = getActiveAvatarUrl();

      // 2. Merge images on canvas to save input tokens
      const mergedBase64 = await mergeImages(avatarUrl, garmentUrls);
      
      setRenderProgressMsg("Llamando a Requesty AI (Gemini 2.5)...");

      // 3. Construct payload and request
      const prompt = `This is a high-fidelity virtual try-on task. The input image is a composite: on the left half is a person (avatar) and on the right half is a vertical stack of clothing items. 
Your task is to generate a SINGLE, UNIFIED, fotorrealistic, high-resolution full-body photo of the person wearing the selected clothing items.
The output image must show ONLY the person wearing the new top and/or bottom clothes, centered and standing in a clean, professional studio background. 
CRITICAL CONSTRAINTS:
1. Do NOT output a split screen or side-by-side comparison.
2. Do NOT copy the side-by-side layout of the input image. 
3. Do NOT include the clothing items on the side.
4. Do NOT show any divider lines, borders, or text.
5. The output must be a single image showing ONLY the person in the new outfit.
Fit parameters: ${fit}% tightness (higher is tighter), lighting setup: ${lighting}% studio intensity.`;

      const response = await fetch("https://router.requesty.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "vertex/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: mergedBase64 } }
              ]
            }
          ],
          image_config: {
            aspect_ratio: "1:1"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error del servidor Requesty (${response.status})`);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message;
      
      if (!message) {
        throw new Error("No se recibió respuesta o contenido del modelo generador.");
      }

      // 4. Parse content to extract the generated image
      setRenderProgressMsg("Procesando imagen devuelta...");
      
      let imageUrlResult = "";
      
      // Check if image is returned in the custom 'images' array (Requesty format for Gemini image generation)
      if (message.images && message.images.length > 0) {
        const firstImg = message.images[0];
        imageUrlResult = firstImg.image_url?.url || firstImg.url || "";
      }
      
      // Fallback: parse from content string
      if (!imageUrlResult && message.content) {
        const content = message.content;
        const mdImageRegex = /!\[.*?\]\((.*?)\)/;
        const mdMatch = content.match(mdImageRegex);
        
        if (mdMatch) {
          imageUrlResult = mdMatch[1];
        } else if (content.trim().startsWith('data:image') || content.trim().startsWith('http')) {
          imageUrlResult = content.trim();
        } else {
          // Look for URL or base64 inside the text response
          const urlRegex = /(https?:\/\/[^\s)]+)/;
          const urlMatch = content.match(urlRegex);
          
          if (urlMatch) {
            imageUrlResult = urlMatch[1];
          } else {
            const base64Regex = /(data:image\/[a-zA-Z+]+;base64,[^\s)]+)/;
            const base64Match = content.match(base64Regex);
            if (base64Match) {
              imageUrlResult = base64Match[1];
            }
          }
        }
      }

      if (!imageUrlResult) {
        console.error("Respuesta cruda del modelo:", data);
        throw new Error("No se pudo extraer la imagen del resultado del probador virtual.");
      }

      setGeneratedImageUrl(imageUrlResult);
      setRenderStep('ready');
    } catch (err: any) {
      console.error(err);
      setRenderError(err.message || "Fallo en la comunicación con el probador virtual.");
      setRenderStep('idle');
    }
  };

  if (isLocked) {
    return (
      <div className="flex-col gap-lg align-center text-center mt-md">
        <div 
          className="pulse-glow-effect"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--logo-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-overlay)'
          }}
        >
          <Crown size={36} />
        </div>

        <div className="flex-col gap-xs">
          <h2 className="title-medium">Probador Virtual <span className="text-gradient-primary">Mirror Mode</span></h2>
          <p className="text-xs text-muted" style={{ padding: '0 24px' }}>
            Desbloquea el motor de renderizado fotorrealista impulsado por la red neuronal autónoma <span className="font-bold text-gradient-primary">Nano Banana 2</span>.
          </p>
        </div>

        {/* Comparison card (Free vs Elite try on) */}
        <div className="glass-card w-full flex-col gap-md text-left">
          <h4 className="text-xs font-bold text-gradient-primary" style={{ letterSpacing: '1px' }}>BENEFICIOS ELITE</h4>
          
          <div className="flex-col gap-sm">
            <div className="flex-row gap-sm align-center">
              <div style={{ color: 'var(--color-elite)' }}><Zap size={14} /></div>
              <span className="text-xs text-muted"><strong style={{ color: 'var(--color-text-primary)' }}>Probador 3D Fotorrealista:</strong> Observa cómo se adapta la prenda a tu tipo de cuerpo en menos de 5 segundos.</span>
            </div>
            <div className="flex-row gap-sm align-center">
              <div style={{ color: 'var(--color-elite)' }}><Zap size={14} /></div>
              <span className="text-xs text-muted"><strong style={{ color: 'var(--color-text-primary)' }}>Modelado Nano Banana 2:</strong> Algoritmo de caída de tela tridimensional y simulación física de pliegues.</span>
            </div>
            <div className="flex-row gap-sm align-center">
              <div style={{ color: 'var(--color-elite)' }}><Zap size={14} /></div>
              <span className="text-xs text-muted"><strong style={{ color: 'var(--color-text-primary)' }}>Personal Shopper AI:</strong> Sugerencias inteligentes de accesorios complementarios según el tono y morfología.</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }} className="flex-col gap-sm">
            <div className="flex-row justify-between align-center">
              <span className="text-sm font-bold text-muted">Suscripción Elite</span>
              <span className="text-lg font-bold text-gradient-primary">$19.99/mes</span>
            </div>
            <button className="btn btn-primary" onClick={() => setActiveTab('plans')}>
              Subir a Elite
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col gap-md">
      <div className="flex-row align-center justify-between">
        <div className="flex-col">
          <h2 className="title-medium text-gradient-primary flex-row align-center gap-xs">
            <Crown size={20} style={{ color: 'var(--color-elite)' }} />
            Probador Virtual
          </h2>
          <p className="text-xs text-muted">Motor físico Nano Banana 2 AI</p>
        </div>
        <span className="eco-badge animate-bounce" style={{ background: 'var(--color-elite-bg)', color: 'var(--color-elite)', borderColor: 'var(--color-elite)' }}>
          Elite Activo 🍌
        </span>
      </div>

      {/* Main Studio Viewport */}
      <div 
        className="glass-card flex-row justify-between relative overflow-hidden"
        style={{ 
          minHeight: '340px',
          background: 'var(--color-bg-muted)',
          border: '1px solid var(--color-border)',
          padding: '16px'
        }}
      >
        {/* Left Side: Garments chosen overlay */}
        <div className="flex-col gap-md justify-center" style={{ zIndex: 10 }}>
          <div className="flex-col align-center gap-xs">
            <span className="text-muted" style={{ fontSize: '0.55rem', fontWeight: 800 }}>SUPERIOR</span>
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {selectedTop ? (
                selectedTop.imageUrl ? (
                  <img src={selectedTop.imageUrl} alt="Top" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                ) : (
                  <GarmentIcon category="tops" color={selectedTop.color} size={20} />
                )
              ) : (
                <div style={{ width: '100%', height: '100%', border: '1px dashed var(--color-border)', borderRadius: 'inherit' }} />
              )}
            </div>
          </div>
          <div className="flex-col align-center gap-xs">
            <span className="text-muted" style={{ fontSize: '0.55rem', fontWeight: 800 }}>INFERIOR</span>
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {selectedBottom ? (
                selectedBottom.imageUrl ? (
                  <img src={selectedBottom.imageUrl} alt="Bottom" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                ) : (
                  <GarmentIcon category="bottoms" color={selectedBottom.color} size={20} />
                )
              ) : (
                <div style={{ width: '100%', height: '100%', border: '1px dashed var(--color-border)', borderRadius: 'inherit' }} />
              )}
            </div>
          </div>
        </div>

        {/* Center: Avatar Model display */}
        <div className="flex-1 flex-col align-center justify-center relative" style={{ padding: '0 12px' }}>
          
          {/* Render Error */}
          {renderError && (
            <div 
              className="flex-row gap-xs align-center w-full"
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '8px 12px',
                color: '#fca5a5',
                fontSize: '0.7rem',
                marginBottom: '12px'
              }}
            >
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{renderError}</span>
            </div>
          )}

          {/* Camera Capture Interface */}
          {isCameraActive ? (
            <div className="flex-col align-center gap-sm w-full relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{ 
                  width: '180px', 
                  height: '180px', 
                  objectFit: 'cover', 
                  borderRadius: '50%',
                  border: '3px solid var(--color-action-primary-bg)',
                  boxShadow: 'var(--shadow-overlay)'
                }}
              />
              <div className="flex-row gap-xs">
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto' }} onClick={capturePhoto}>
                  Capturar
                </button>
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto' }} onClick={stopCamera}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              {renderStep === 'idle' && (
                <div className="flex-col align-center text-center gap-sm">
                  <div 
                    style={{
                      width: '130px',
                      height: '190px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundImage: `url(${getActiveAvatarUrl()})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: 'var(--shadow-overlay)'
                    }}
                  >
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        width: '100%', 
                        background: 'rgba(0,0,0,0.6)', 
                        color: 'white', 
                        fontSize: '0.55rem', 
                        padding: '4px 0', 
                        textAlign: 'center',
                        borderBottomLeftRadius: 'inherit',
                        borderBottomRightRadius: 'inherit',
                        fontWeight: 700
                      }}
                    >
                      AVATAR ACTIVO
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '0.75rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }} 
                    onClick={handleStartRender}
                  >
                    <Sparkles size={14} />
                    Procesar Probador AI
                  </button>
                </div>
              )}

              {renderStep === 'rendering' && (
                <div className="flex-col align-center gap-sm">
                  <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--color-action-primary-bg)' }} />
                  <span className="text-xs font-bold text-gradient-primary text-center" style={{ maxWidth: '160px' }}>
                    {renderProgressMsg}
                  </span>
                  <div className="scanning-bar" />
                </div>
              )}

              {renderStep === 'ready' && generatedImageUrl && (
                <div className="w-full h-full flex-col align-center justify-center relative">
                  <div 
                    style={{
                      width: '180px',
                      height: '240px',
                      backgroundImage: `url(${generatedImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 'var(--radius-lg)',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '2px solid var(--color-action-primary-bg)',
                      boxShadow: '0 0 15px rgba(167, 139, 250, 0.4)'
                    }}
                    className="eternal-glow-effect"
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: '24px',
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.55rem',
                        color: 'var(--color-action-primary-text)',
                        fontWeight: 700
                      }}
                    >
                      RESULTADO VIRTUAL
                    </div>
                  </div>

                  <button 
                    className="btn btn-outline" 
                    style={{ position: 'absolute', bottom: '-10px', padding: '4px 10px', fontSize: '0.65rem', width: 'auto' }}
                    onClick={() => setRenderStep('idle')}
                  >
                    Restablecer
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Parameter Info */}
        <div className="flex-col gap-sm justify-center" style={{ zIndex: 10 }}>
          <div className="flex-row align-center gap-xs">
            <Sliders size={12} className="text-muted" />
            <span className="text-muted font-bold" style={{ fontSize: '0.55rem' }}>AI SLIDERS</span>
          </div>
          
          <div className="flex-col gap-xs">
            <span className="text-muted" style={{ fontSize: '0.55rem' }}>AJUSTE: {fit}%</span>
            <input 
              type="range" 
              min="0" max="100" 
              value={fit} 
              onChange={(e) => setFit(Number(e.target.value))}
              style={{ width: '50px', accentColor: 'var(--color-action-primary-bg)' }}
            />
          </div>

          <div className="flex-col gap-xs">
            <span className="text-muted" style={{ fontSize: '0.55rem' }}>LUZ: {lighting}%</span>
            <input 
              type="range" 
              min="0" max="100" 
              value={lighting} 
              onChange={(e) => setLighting(Number(e.target.value))}
              style={{ width: '50px', accentColor: 'var(--color-action-primary-bg)' }}
            />
          </div>
        </div>
      </div>

      {/* Select Studio Elements */}
      <div className="glass-card flex-col gap-md">
        <div className="flex-col gap-xs">
          <h4 className="text-xs font-bold text-muted">Estudio de Modelado</h4>
          <span className="text-muted" style={{ fontSize: '0.65rem' }}>Configura el avatar corporal y las prendas de vestir</span>
        </div>

        {/* Avatar custom upload inputs */}
        <input 
          type="file" 
          ref={avatarFileInputRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleAvatarFileChange} 
        />

        <div className="form-group">
          <label className="form-label">Elegir Avatar Corporal</label>
          
          {/* Base models list */}
          <div className="grid-3" style={{ marginBottom: '8px' }}>
            {defaultAvatars.map(avatar => (
              <button
                key={avatar.id}
                className={`btn ${selectedAvatarId === avatar.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '6px 8px', fontSize: '0.7rem' }}
                onClick={() => setSelectedAvatarId(avatar.id)}
              >
                {avatar.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Camera and Upload custom buttons */}
          <div className="flex-row gap-xs align-center">
            {customAvatarUrl ? (
              <div 
                className="flex-row align-center justify-between w-full p-xs glass-card"
                style={{ background: 'rgba(255,255,255,0.02)', padding: '6px 12px', border: '1px solid var(--color-border)' }}
              >
                <button
                  className={`btn ${selectedAvatarId === 'custom' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '4px 10px', fontSize: '0.65rem', width: 'auto' }}
                  onClick={() => setSelectedAvatarId('custom')}
                >
                  Usar Mi Foto Custom
                </button>
                <button 
                  className="text-muted hover:text-white"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={handleDeleteCustomAvatar}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="grid-2 w-full">
                <button 
                  className="btn btn-outline" 
                  onClick={startCamera}
                  style={{ fontSize: '0.65rem', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Camera size={12} />
                  Abrir Cámara (Cuerpo completo)
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => avatarFileInputRef.current?.click()}
                  style={{ fontSize: '0.65rem', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Upload size={12} />
                  Subir Foto (Cuerpo completo)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Garment selection dropdowns and upload inputs */}
        <input 
          type="file" 
          ref={topUploadInputRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={(e) => handleGarmentUpload(e, 'tops')} 
        />
        <input 
          type="file" 
          ref={bottomUploadInputRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={(e) => handleGarmentUpload(e, 'bottoms')} 
        />

        {garmentUploadProgress !== 'idle' && (
          <div className="glass-card flex-row gap-xs align-center" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)' }}>
            <RefreshCw className="animate-spin text-gradient-primary" size={14} />
            <span className="text-xs text-muted">
              {garmentUploadProgress === 'uploading' && 'Subiendo prenda al servidor...'}
              {garmentUploadProgress === 'classifying' && 'Analizando prenda con IA...'}
              {garmentUploadProgress === 'done' && '¡Prenda cargada correctamente!'}
            </span>
          </div>
        )}

        {garmentUploadError && (
          <div className="flex-row gap-xs align-center p-xs" style={{ color: '#fca5a5', fontSize: '0.65rem' }}>
            <AlertCircle size={12} />
            <span>{garmentUploadError}</span>
          </div>
        )}

        <div className="grid-2">
          {/* Top selection dropdown */}
          <div className="form-group">
            <div className="flex-row justify-between align-center" style={{ marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>Prenda Superior</label>
              <button 
                className="text-muted hover:text-white flex-row align-center gap-xs"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem' }}
                onClick={() => topUploadInputRef.current?.click()}
              >
                <Plus size={10} /> Subir
              </button>
            </div>
            {tops.length > 0 ? (
              <select
                className="input-glass"
                value={selectedTop?.id || ''}
                onChange={(e) => setSelectedTop(tops.find(t => t.id === e.target.value) || null)}
                style={{ background: 'var(--color-bg-muted)', fontSize: '0.75rem', padding: '10px' }}
              >
                <option value="">(Ninguna)</option>
                {tops.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <div 
                className="text-center text-muted" 
                style={{ 
                  padding: '10px', 
                  border: '1px dashed var(--color-border)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.7rem' 
                }}
              >
                No hay prendas superiores.
              </div>
            )}
          </div>

          {/* Bottom selection dropdown */}
          <div className="form-group">
            <div className="flex-row justify-between align-center" style={{ marginBottom: '4px' }}>
              <label className="form-label" style={{ margin: 0 }}>Prenda Inferior</label>
              <button 
                className="text-muted hover:text-white flex-row align-center gap-xs"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.65rem' }}
                onClick={() => bottomUploadInputRef.current?.click()}
              >
                <Plus size={10} /> Subir
              </button>
            </div>
            {bottoms.length > 0 ? (
              <select
                className="input-glass"
                value={selectedBottom?.id || ''}
                onChange={(e) => setSelectedBottom(bottoms.find(b => b.id === e.target.value) || null)}
                style={{ background: 'var(--color-bg-muted)', fontSize: '0.75rem', padding: '10px' }}
              >
                <option value="">(Ninguna)</option>
                {bottoms.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            ) : (
              <div 
                className="text-center text-muted" 
                style={{ 
                  padding: '10px', 
                  border: '1px dashed var(--color-border)', 
                  borderRadius: 'var(--radius-sm)', 
                  fontSize: '0.7rem' 
                }}
              >
                No hay prendas inferiores.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

