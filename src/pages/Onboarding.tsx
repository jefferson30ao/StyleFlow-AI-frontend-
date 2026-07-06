import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { GarmentCategory } from '../types';
import { GarmentIcon } from '../components/GarmentIcon';
import { Sparkles, Camera, ArrowRight, Check, RefreshCw, AlertCircle } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface DemoGarment {
  name: string;
  category: GarmentCategory;
  color: string;
  previewUrl: string;
}

const DEMO_GARMENTS: DemoGarment[] = [
  { name: 'Top Verde Menta', category: 'tops', color: '#6ee7b7', previewUrl: 'top_mint' },
  { name: 'Pantalón Cuero Negro', category: 'bottoms', color: '#18181b', previewUrl: 'pants_leather' },
  { name: 'Casaca Jean Celeste', category: 'outerwear', color: '#93c5fd', previewUrl: 'jacket_denim' }
];

export const Onboarding: React.FC = () => {
  const { addGarment, completeOnboarding, simulateBgRemoval, user } = useApp();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDemo, setSelectedDemo] = useState<DemoGarment | null>(null);
  
  // BG removal simulator states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [processedGarment, setProcessedGarment] = useState<DemoGarment | null>(null);
  
  // User name input
  const [userName, setUserName] = useState<string>(user?.name || 'Valeria');
  const [digitizedCount, setDigitizedCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleStartDigitizing = () => {
    if (!userName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleSelectDemo = (demo: DemoGarment) => {
    if (isProcessing) return;
    setSelectedDemo(demo);
    setIsProcessed(false);
    setProcessedGarment(null);
  };

  const handleTriggerVisualAgent = async () => {
    if (!selectedDemo) return;
    setIsProcessing(true);
    setErrorMsg('');
    
    try {
      // Trigger the mock background removal
      await simulateBgRemoval(selectedDemo.previewUrl);
      setIsProcessed(true);
      setProcessedGarment(selectedDemo);
    } catch (err) {
      setErrorMsg('Error en el servicio de IA. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToCloset = async () => {
    if (!processedGarment) return;
    
    const success = await addGarment({
      name: processedGarment.name,
      category: processedGarment.category,
      color: processedGarment.color,
      imageUrl: processedGarment.previewUrl,
      hasBgRemoved: true
    });

    if (success) {
      setDigitizedCount(prev => prev + 1);
      setSelectedDemo(null);
      setIsProcessed(false);
      setProcessedGarment(null);
    } else {
      setErrorMsg('Has alcanzado el límite de prendas para la versión Free (20 prendas).');
    }
  };

  return (
    <div className="flex-col w-full h-full justify-between" style={{ minHeight: '80vh' }}>
      {step === 1 ? (
        <div className="flex-col gap-lg mt-lg text-center align-center">
          <div className="logo-glow" style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)' }}>
            <img src={logoImg} alt="StyleFlow AI" />
          </div>
          
          <div className="flex-col gap-sm">
            <h1 className="title-large">Bienvenido a <span className="text-gradient-primary">StyleFlow AI</span></h1>
            <p className="text-sm text-muted" style={{ padding: '0 16px' }}>
              Tu planificador de outfits proactivo y autónomo que elimina la parálisis de decisión diaria.
            </p>
          </div>

          <div className="glass-card w-full mt-md text-left flex-col gap-md">
            <h3 className="title-medium text-gradient-primary">Comencemos tu Estilo</h3>
            <p className="text-xs text-muted">
              Para personalizar tus recomendaciones según el clima de Lima Metropolitana y tu agenda, primero dinos tu nombre.
            </p>
            
            <div className="form-group">
              <label className="form-label">Nombre de Usuario</label>
              <input 
                type="text" 
                className="input-glass" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej. Valeria" 
              />
              {errorMsg && (
                <div className="flex-row align-center gap-xs mt-sm" style={{ color: 'var(--color-error)' }}>
                  <AlertCircle size={14} />
                  <span className="text-xs">{errorMsg}</span>
                </div>
              )}
            </div>

            <button className="btn btn-primary" onClick={handleStartDigitizing}>
              Empezar Onboarding
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-md">
          <div className="flex-col gap-xs">
            <span className="text-xs font-bold text-gradient-primary" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
              Fase de Onboarding • Asistente Visual
            </span>
            <h2 className="title-medium">Digitaliza tu Clóset</h2>
            <p className="text-xs text-muted">
              El **Visual Agent** automatiza la eliminación de fondos en menos de 5 segundos. ¡Haz la prueba con una prenda de demostración!
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex-row align-center justify-between glass-card" style={{ padding: '12px 16px' }}>
            <span className="text-xs font-medium">Prendas digitalizadas:</span>
            <div className="flex-row align-center gap-sm">
              <span className="text-sm font-bold text-gradient-primary">{digitizedCount} / 3</span>
              <div 
                style={{ 
                  width: '80px', 
                  height: '6px', 
                  backgroundColor: 'var(--color-border)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: `${Math.min((digitizedCount / 3) * 100, 100)}%`, 
                    height: '100%', 
                    background: 'var(--progress-gradient)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sandbox workspace */}
          <div className="glass-card flex-col align-center justify-center relative overflow-hidden" style={{ minHeight: '260px' }}>
            {selectedDemo ? (
              <div className="w-full flex-col align-center gap-md">
                {/* Image Frame with checkerboard simulation */}
                <div 
                  style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: isProcessed 
                      ? 'repeating-conic-gradient(var(--color-hover-lift) 0% 25%, transparent 0% 50%) 50% / 16px 16px'
                      : 'var(--color-bg-muted)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <GarmentIcon category={selectedDemo.category} color={selectedDemo.color} size={56} />
                  
                  {isProcessing && (
                    <>
                      <div className="scanning-bar" />
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0, right: 0, bottom: 0, left: 0,
                          background: 'var(--color-hover-lift)',
                          backdropFilter: 'blur(1px)'
                        }}
                      />
                    </>
                  )}

                  {isProcessed && (
                    <div 
                      className="eco-badge animate-bounce" 
                      style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 6px', fontSize: '0.6rem' }}
                    >
                      Recorte Listo
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h4 className="text-sm font-bold">{selectedDemo.name}</h4>
                  <p className="text-xs text-muted">Categoría: {selectedDemo.category} • Color: {selectedDemo.color}</p>
                </div>

                <div className="flex-row gap-sm w-full">
                  {!isProcessed ? (
                    <button 
                      className="btn btn-primary" 
                      disabled={isProcessing} 
                      onClick={handleTriggerVisualAgent}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} />
                          Borrando fondo...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Visual Agent: Quitar Fondo
                        </>
                      )}
                    </button>
                  ) : (
                    <button className="btn btn-secondary" onClick={handleSaveToCloset}>
                      <Check size={16} />
                      Guardar en Clóset
                    </button>
                  )}
                  
                  <button 
                    className="btn btn-outline" 
                    disabled={isProcessing} 
                    onClick={() => {
                      setSelectedDemo(null);
                      setIsProcessed(false);
                    }}
                    style={{ width: '40px', padding: '12px' }}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center flex-col align-center gap-md" style={{ padding: '20px' }}>
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--color-bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-tertiary)'
                  }}
                >
                  <Camera size={28} />
                </div>
                <div className="flex-col gap-xs">
                  <h4 className="text-sm font-medium">Selecciona una prenda para procesar</h4>
                  <p className="text-xs text-muted">Usa una de nuestras fotos de prueba tomadas en Lima para simular la cámara.</p>
                </div>
                
                {/* Selection items */}
                <div className="flex-row gap-sm justify-center w-full mt-sm">
                  {DEMO_GARMENTS.map((g, idx) => (
                    <button
                      key={idx}
                      className="glass-card interactive flex-col align-center gap-xs"
                      onClick={() => handleSelectDemo(g)}
                      style={{ padding: '10px', width: '90px', cursor: 'pointer' }}
                    >
                      <div style={{ width: '40px', height: '40px' }}>
                        <GarmentIcon category={g.category} color={g.color} size={20} />
                      </div>
                      <span className="text-xs font-bold" style={{ fontSize: '0.62rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        {g.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="glass-card flex-row align-center gap-sm" style={{ borderLeft: '4px solid var(--color-error)', padding: '12px', background: 'var(--color-error-bg)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-error)' }} />
              <span className="text-xs">{errorMsg}</span>
            </div>
          )}

          {/* Continue bar */}
          <div className="flex-col gap-sm mt-md">
            <button 
              className="btn btn-primary" 
              disabled={digitizedCount < 1} 
              onClick={completeOnboarding}
            >
              Comenzar Experiencia
              <ArrowRight size={18} />
            </button>
            <span className="text-xs text-muted text-center">
              {digitizedCount === 0 
                ? 'Debes digitalizar al menos 1 prenda de demostración para iniciar.' 
                : `¡Estás listo! Has cargado ${digitizedCount} prendas en tu clóset.`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
