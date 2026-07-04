import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Garment } from '../types';
import { GarmentIcon } from '../components/GarmentIcon';
import { Lock, Unlock, Shuffle, Heart, X, Sparkles, RefreshCw } from 'lucide-react';

export const MixMatch: React.FC = () => {
  const { closet, feedbackOutfit } = useApp();
  
  // Categorized items
  const tops = closet.filter(c => c.category === 'tops');
  const bottoms = closet.filter(c => c.category === 'bottoms');
  const outers = closet.filter(c => c.category === 'outerwear');
  const shoes = closet.filter(c => c.category === 'shoes');

  // Currently selected slots
  const [selectedTop, setSelectedTop] = useState<Garment | null>(tops[0] || null);
  const [selectedBottom, setSelectedBottom] = useState<Garment | null>(bottoms[0] || null);
  const [selectedOuter, setSelectedOuter] = useState<Garment | null>(outers[0] || null);
  const [selectedShoe, setSelectedShoe] = useState<Garment | null>(shoes[0] || null);

  // Lock status
  const [lockTop, setLockTop] = useState(false);
  const [lockBottom, setLockBottom] = useState(false);
  const [lockOuter, setLockOuter] = useState(false);
  const [lockShoe, setLockShoe] = useState(false);

  // Action feedback states
  const [isGenerating, setIsGenerating] = useState(false);
  const [swipeFeedback, setSwipeFeedback] = useState<'liked' | 'disliked' | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      // Shuffling unlocked categories
      if (!lockTop && tops.length > 0) {
        const randomTop = tops[Math.floor(Math.random() * tops.length)];
        setSelectedTop(randomTop);
      }
      if (!lockBottom && bottoms.length > 0) {
        const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        setSelectedBottom(randomBottom);
      }
      if (!lockOuter && outers.length > 0) {
        const randomOuter = outers[Math.floor(Math.random() * outers.length)];
        setSelectedOuter(randomOuter);
      }
      if (!lockShoe && shoes.length > 0) {
        const randomShoe = shoes[Math.floor(Math.random() * shoes.length)];
        setSelectedShoe(randomShoe);
      }
      setIsGenerating(false);
    }, 800);
  };

  const handleShuffleSlot = (category: 'tops' | 'bottoms' | 'outerwear' | 'shoes') => {
    switch (category) {
      case 'tops':
        if (tops.length > 0) setSelectedTop(tops[Math.floor(Math.random() * tops.length)]);
        break;
      case 'bottoms':
        if (bottoms.length > 0) setSelectedBottom(bottoms[Math.floor(Math.random() * bottoms.length)]);
        break;
      case 'outerwear':
        if (outers.length > 0) setSelectedOuter(outers[Math.floor(Math.random() * outers.length)]);
        break;
      case 'shoes':
        if (shoes.length > 0) setSelectedShoe(shoes[Math.floor(Math.random() * shoes.length)]);
        break;
    }
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    setSwipeFeedback(type === 'like' ? 'liked' : 'disliked');
    feedbackOutfit('custom_ootd', type);
    
    setTimeout(() => {
      setSwipeFeedback(null);
      // Auto shuffle to new combination on swipe
      handleGenerate();
    }, 600);
  };

  return (
    <div className="flex-col gap-md">
      <div className="flex-col">
        <h2 className="title-medium text-gradient-primary">Mix & Match Inteligente</h2>
        <p className="text-xs text-muted">Combina prendas libres y entrena tu motor de estilo</p>
      </div>

      {/* Outfit Canvas Workspace */}
      <div 
        className="glass-card flex-col align-center justify-center gap-md relative"
        style={{ 
          minHeight: '360px', 
          border: swipeFeedback === 'liked' 
            ? '2px solid hsl(var(--secondary))' 
            : swipeFeedback === 'disliked' 
            ? '2px solid hsl(var(--error))' 
            : '1px solid hsla(var(--border-color), 0.6)',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Swipe overlay feedback */}
        {swipeFeedback && (
          <div 
            style={{
              position: 'absolute',
              top: '20px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#fff',
              zIndex: 30,
              transform: swipeFeedback === 'liked' ? 'rotate(-10deg)' : 'rotate(10deg)',
              background: swipeFeedback === 'liked' ? 'hsl(var(--secondary))' : 'hsl(var(--error))',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {swipeFeedback === 'liked' ? '¡ME ENCANTA!' : 'PASAR'}
          </div>
        )}

        {/* Slot Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
          
          {/* Top Slot */}
          <div className="flex-col align-center relative glass-card" style={{ padding: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <span className="text-xs text-muted font-bold" style={{ fontSize: '0.65rem' }}>SUPERIOR (TOP)</span>
            <div style={{ width: '80px', height: '80px', margin: '8px 0' }}>
              {selectedTop ? (
                <GarmentIcon category="tops" color={selectedTop.color} size={28} />
              ) : (
                <div className="flex-col align-center justify-center w-full h-full text-muted border-dashed border-2 rounded-xl">Vacío</div>
              )}
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                onClick={() => setLockTop(!lockTop)} 
                style={{ background: 'none', border: 'none', color: lockTop ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', cursor: 'pointer' }}
              >
                {lockTop ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={() => handleShuffleSlot('tops')}
                disabled={lockTop}
                style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: lockTop ? 'not-allowed' : 'pointer' }}
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>

          {/* Bottom Slot */}
          <div className="flex-col align-center relative glass-card" style={{ padding: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <span className="text-xs text-muted font-bold" style={{ fontSize: '0.65rem' }}>INFERIOR (BOTTOM)</span>
            <div style={{ width: '80px', height: '80px', margin: '8px 0' }}>
              {selectedBottom ? (
                <GarmentIcon category="bottoms" color={selectedBottom.color} size={28} />
              ) : (
                <div className="flex-col align-center justify-center w-full h-full text-muted border-dashed border-2 rounded-xl">Vacío</div>
              )}
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                onClick={() => setLockBottom(!lockBottom)} 
                style={{ background: 'none', border: 'none', color: lockBottom ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', cursor: 'pointer' }}
              >
                {lockBottom ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={() => handleShuffleSlot('bottoms')}
                disabled={lockBottom}
                style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: lockBottom ? 'not-allowed' : 'pointer' }}
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>

          {/* Outerwear Slot */}
          <div className="flex-col align-center relative glass-card" style={{ padding: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <span className="text-xs text-muted font-bold" style={{ fontSize: '0.65rem' }}>ABRIGO (CAPA)</span>
            <div style={{ width: '80px', height: '80px', margin: '8px 0' }}>
              {selectedOuter ? (
                <GarmentIcon category="outerwear" color={selectedOuter.color} size={28} />
              ) : (
                <div className="flex-col align-center justify-center w-full h-full text-muted border-dashed border-2 rounded-xl" style={{ fontSize: '0.6rem', border: '1px dashed hsla(var(--border-color), 1)', borderRadius: '12px' }}>Sin abrigo</div>
              )}
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                onClick={() => setLockOuter(!lockOuter)} 
                style={{ background: 'none', border: 'none', color: lockOuter ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', cursor: 'pointer' }}
              >
                {lockOuter ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={() => handleShuffleSlot('outerwear')}
                disabled={lockOuter}
                style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: lockOuter ? 'not-allowed' : 'pointer' }}
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>

          {/* Shoes Slot */}
          <div className="flex-col align-center relative glass-card" style={{ padding: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <span className="text-xs text-muted font-bold" style={{ fontSize: '0.65rem' }}>CALZADO (SHOES)</span>
            <div style={{ width: '80px', height: '80px', margin: '8px 0' }}>
              {selectedShoe ? (
                <GarmentIcon category="shoes" color={selectedShoe.color} size={28} />
              ) : (
                <div className="flex-col align-center justify-center w-full h-full text-muted border-dashed border-2 rounded-xl">Vacío</div>
              )}
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                onClick={() => setLockShoe(!lockShoe)} 
                style={{ background: 'none', border: 'none', color: lockShoe ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', cursor: 'pointer' }}
              >
                {lockShoe ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={() => handleShuffleSlot('shoes')}
                disabled={lockShoe}
                style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: lockShoe ? 'not-allowed' : 'pointer' }}
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Generate / Action trigger */}
        <button 
          className="btn btn-primary mt-sm" 
          disabled={isGenerating} 
          onClick={handleGenerate}
          style={{ width: '90%' }}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Buscando combinaciones...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generar Outfit con IA
            </>
          )}
        </button>
      </div>

      {/* Interaction Feed Controls */}
      <div className="flex-row justify-center gap-md align-center mt-sm">
        <button 
          className="btn btn-outline pulse-glow-effect" 
          onClick={() => handleReaction('dislike')}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            padding: 0,
            border: '1px solid hsla(var(--error), 0.5)',
            color: 'hsl(var(--error))',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)'
          }}
        >
          <X size={28} />
        </button>

        <span className="text-xs text-muted font-medium">Calificar Outfit</span>

        <button 
          className="btn btn-outline pulse-glow-effect" 
          onClick={() => handleReaction('like')}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            padding: 0,
            border: '1px solid hsla(var(--secondary), 0.5)',
            color: 'hsl(var(--secondary))',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)'
          }}
        >
          <Heart size={28} />
        </button>
      </div>
    </div>
  );
};
