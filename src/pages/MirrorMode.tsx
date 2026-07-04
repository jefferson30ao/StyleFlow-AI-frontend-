import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GarmentIcon } from '../components/GarmentIcon';
import { Crown, User, RefreshCw, Sliders, Zap } from 'lucide-react';
import type { Garment } from '../types';

export const MirrorMode: React.FC = () => {
  const { user, closet, setActiveTab } = useApp();
  
  // Mirror Mode is only available in 'elite' plan
  const isLocked = user.plan !== 'elite';

  const tops = closet.filter(c => c.category === 'tops');
  const bottoms = closet.filter(c => c.category === 'bottoms');

  const [selectedTop, setSelectedTop] = useState<Garment | null>(tops[0] || null);
  const [selectedBottom, setSelectedBottom] = useState<Garment | null>(bottoms[0] || null);
  
  // Avatars
  const avatars = [
    { id: 'a1', name: 'Valeria (Modelo Base)', gender: 'female', height: '1.68m' },
    { id: 'a2', name: 'Avatar Atlético', gender: 'female', height: '1.70m' },
    { id: 'a3', name: 'Avatar Curvy', gender: 'female', height: '1.65m' }
  ];
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  // Adjustments
  const [fit, setFit] = useState(50); // tight vs oversized
  const [lighting, setLighting] = useState(70); // daylight vs studio
  const [renderStep, setRenderStep] = useState<'idle' | 'rendering' | 'ready'>('idle');

  const handleStartRender = () => {
    setRenderStep('rendering');
    setTimeout(() => {
      setRenderStep('ready');
    }, 3000); // 3s render simulation
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
            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)'
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
              <div style={{ color: '#f59e0b' }}><Zap size={14} /></div>
              <span className="text-xs text-muted"><strong style={{ color: '#fff' }}>Probador 3D Fotorrealista:</strong> Observa cómo se adapta la prenda a tu tipo de cuerpo en menos de 5 segundos.</span>
            </div>
            <div className="flex-row gap-sm align-center">
              <div style={{ color: '#f59e0b' }}><Zap size={14} /></div>
              <span className="text-xs text-muted"><strong style={{ color: '#fff' }}>Modelado Nano Banana 2:</strong> Algoritmo de caída de tela tridimensional y simulación física de pliegues.</span>
            </div>
            <div className="flex-row gap-sm align-center">
              <div style={{ color: '#f59e0b' }}><Zap size={14} /></div>
              <span className="text-xs text-muted"><strong style={{ color: '#fff' }}>Personal Shopper AI:</strong> Sugerencias inteligentes de accesorios complementarios según el tono y morfología.</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid hsla(var(--border-color), 0.8)', paddingTop: '16px' }} className="flex-col gap-sm">
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
            <Crown size={20} style={{ color: '#f59e0b' }} />
            Probador Virtual
          </h2>
          <p className="text-xs text-muted">Motor físico Nano Banana 2 AI</p>
        </div>
        <span className="eco-badge animate-bounce" style={{ background: 'hsla(35, 92%, 50%, 0.15)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' }}>
          Elite Activo 🍌
        </span>
      </div>

      {/* Main Studio Viewport */}
      <div 
        className="glass-card flex-row justify-between relative overflow-hidden"
        style={{ 
          minHeight: '280px',
          background: 'radial-gradient(circle at center, rgba(30, 27, 75, 0.4) 0%, rgba(23, 27, 38, 0.8) 100%)',
          border: '1px solid hsla(var(--primary), 0.3)'
        }}
      >
        {/* Left Side: Garments chosen overlay */}
        <div className="flex-col gap-sm justify-center" style={{ zIndex: 10 }}>
          <div className="flex-col align-center gap-xs">
            <span className="text-muted" style={{ fontSize: '0.55rem', fontWeight: 800 }}>PRENDA INICIAL</span>
            <div style={{ width: '48px', height: '48px' }}>
              {selectedTop ? (
                <GarmentIcon category="tops" color={selectedTop.color} size={16} />
              ) : (
                <div style={{ width: '100%', height: '100%', border: '1px dashed hsla(var(--border-color), 1)', borderRadius: '8px' }} />
              )}
            </div>
          </div>
          <div className="flex-col align-center gap-xs">
            <span className="text-muted" style={{ fontSize: '0.55rem', fontWeight: 800 }}>SEGUNDA PRENDA</span>
            <div style={{ width: '48px', height: '48px' }}>
              {selectedBottom ? (
                <GarmentIcon category="bottoms" color={selectedBottom.color} size={16} />
              ) : (
                <div style={{ width: '100%', height: '100%', border: '1px dashed hsla(var(--border-color), 1)', borderRadius: '8px' }} />
              )}
            </div>
          </div>
        </div>

        {/* Center: Avatar Model display */}
        <div className="flex-1 flex-col align-center justify-center relative">
          {renderStep === 'idle' && (
            <div className="flex-col align-center text-center gap-sm">
              <div 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--text-muted))'
                }}
              >
                <User size={36} />
              </div>
              <span className="text-xs text-muted">¿Listo para simular la caída de tela?</span>
              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem', width: 'auto' }} onClick={handleStartRender}>
                Procesar Probador AI
              </button>
            </div>
          )}

          {renderStep === 'rendering' && (
            <div className="flex-col align-center gap-sm">
              <RefreshCw className="animate-spin" size={32} style={{ color: 'hsl(var(--primary))' }} />
              <span className="text-xs font-bold text-gradient-primary">Nano Banana 2: Analizando pliegues...</span>
              <div className="scanning-bar" />
            </div>
          )}

          {renderStep === 'ready' && (
            <div className="w-full h-full flex-col align-center justify-center relative">
              {/* Virtual model try on mockup */}
              <div 
                style={{
                  width: '120px',
                  height: '190px',
                  background: `linear-gradient(180deg, ${selectedTop?.color || '#333'} 40%, ${selectedBottom?.color || '#666'} 40%)`,
                  borderRadius: '24px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: 'var(--shadow-lg), 0 0 20px rgba(139, 92, 246, 0.4)'
                }}
                className="pulse-glow-effect"
              >
                {/* Model face overlay silhouette */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#e0a96d',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                />
                
                {/* Visual Agent checker background hint to show background transparency cut */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: '24px',
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.5rem',
                    color: '#a78bfa',
                    fontWeight: 700
                  }}
                >
                  NANO BANANA 3D
                </div>
              </div>

              <button 
                className="btn btn-outline" 
                style={{ position: 'absolute', bottom: '6px', padding: '4px 8px', fontSize: '0.6rem', width: 'auto' }}
                onClick={() => setRenderStep('idle')}
              >
                Restablecer
              </button>
            </div>
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
              style={{ width: '50px', accentColor: 'hsl(var(--primary))' }}
            />
          </div>

          <div className="flex-col gap-xs">
            <span className="text-muted" style={{ fontSize: '0.55rem' }}>LUZ: {lighting}%</span>
            <input 
              type="range" 
              min="0" max="100" 
              value={lighting} 
              onChange={(e) => setLighting(Number(e.target.value))}
              style={{ width: '50px', accentColor: 'hsl(var(--primary))' }}
            />
          </div>
        </div>
      </div>

      {/* Select Studio Elements */}
      <div className="glass-card flex-col gap-md">
        <h4 className="text-xs font-bold text-muted">Estudio de Modelado</h4>

        <div className="form-group">
          <label className="form-label">Elegir Avatar Corporal</label>
          <div className="grid-3">
            {avatars.map(avatar => (
              <button
                key={avatar.id}
                className={`btn ${selectedAvatar.id === avatar.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '6px 8px', fontSize: '0.7rem' }}
                onClick={() => setSelectedAvatar(avatar)}
              >
                {avatar.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-2">
          {/* Top selection dropdown */}
          <div className="form-group">
            <label className="form-label">Prenda Superior</label>
            <select
              className="input-glass"
              value={selectedTop?.id || ''}
              onChange={(e) => setSelectedTop(tops.find(t => t.id === e.target.value) || null)}
              style={{ background: 'hsl(var(--bg-card))', fontSize: '0.75rem', padding: '10px' }}
            >
              {tops.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Bottom selection dropdown */}
          <div className="form-group">
            <label className="form-label">Prenda Inferior</label>
            <select
              className="input-glass"
              value={selectedBottom?.id || ''}
              onChange={(e) => setSelectedBottom(bottoms.find(b => b.id === e.target.value) || null)}
              style={{ background: 'hsl(var(--bg-card))', fontSize: '0.75rem', padding: '10px' }}
            >
              {bottoms.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
