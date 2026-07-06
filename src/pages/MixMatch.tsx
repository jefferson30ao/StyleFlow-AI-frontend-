import React, { useState, useEffect } from 'react';
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
  const [selectedTop, setSelectedTop] = useState<Garment | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<Garment | null>(null);
  const [selectedOuter, setSelectedOuter] = useState<Garment | null>(null);
  const [selectedShoe, setSelectedShoe] = useState<Garment | null>(null);

  // Sync slots when closet is loaded or changes
  useEffect(() => {
    if (!selectedTop && tops.length > 0) setSelectedTop(tops[0]);
    if (!selectedBottom && bottoms.length > 0) setSelectedBottom(bottoms[0]);
    if (!selectedOuter && outers.length > 0) setSelectedOuter(outers[0]);
    if (!selectedShoe && shoes.length > 0) setSelectedShoe(shoes[0]);
  }, [closet, tops, bottoms, outers, shoes, selectedTop, selectedBottom, selectedOuter, selectedShoe]);

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
    <div className="flex-col gap-md animate-fade-in">
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
            ? '2px solid var(--color-success)' 
            : swipeFeedback === 'disliked' 
            ? '2px solid var(--color-error)' 
            : '1px solid var(--color-border)',
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
              background: swipeFeedback === 'liked' ? 'var(--color-success)' : 'var(--color-error)',
              boxShadow: 'var(--shadow-overlay)'
            }}
          >
            {swipeFeedback === 'liked' ? '¡ME ENCANTA!' : 'PASAR'}
          </div>
        )}

        {/* Slot Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
          
          {/* Top Slot */}
          <div className="flex-col align-center relative glass-card" style={{ padding: '8px', background: 'var(--color-bg-muted)' }}>
            <span className="text-xs text-muted font-bold" style={{ fontSize: '0.65rem' }}>SUPERIOR (TOP)</span>
            <div style={{ width: '80px', height: '80px', margin: '8px 0', position: 'relative' }}>
              {selectedTop ? (
                selectedTop.imageUrl ? (
                  <img 
                    src={selectedTop.imageUrl} 
                    alt={selectedTop.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                  />
                ) : (
                  <GarmentIcon category="tops" color={selectedTop.color} size={28} />
                )
              ) : (
                <div className="flex-col align-center justify-center w-full h-full text-muted border-dashed border-2 rounded-xl" style={{ fontSize: '0.6rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)' }}>Vacío</div>
              )}
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                onClick={() => setLockTop(!lockTop)} 
                style={{ background: 'none', border: 'none', color: lockTop ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', cursor: 'pointer' }}
              >
                {lockTop ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={() => handleShuffleSlot('tops')}
                disabled={lockTop}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: lockTop ? 'not-allowed' : 'pointer' }}
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>

          {/* Bottom Slot */}
          <div className="flex-col align-center relative glass-card" style={{ padding: '8px', background: 'var(--color-bg-muted)' }}>
            <span className="text-xs text-muted font-bold" style={{ fontSize: '0.65rem' }}>INFERIOR (BOTTOM)</span>
            <div style={{ width: '80px', height: '80px', margin: '8px 0', position: 'relative' }}>
              {selectedBottom ? (
                selectedBottom.imageUrl ? (
                  <img 
                    src={selectedBottom.imageUrl} 
                    alt={selectedBottom.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                  />
                ) : (
                  <GarmentIcon category="bottoms" color={selectedBottom.color} size={28} />
                )
              ) : (
                <div className="flex-col align-center justify-center w-full h-full text-muted border-dashed border-2 rounded-xl" style={{ fontSize: '0.6rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)' }}>Vacío</div>
              )}
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                onClick={() => setLockBottom(!lockBottom)} 
                style={{ background: 'none', border: 'none', color: lockBottom ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', cursor: 'pointer' }}
              >
                {lockBottom ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={() => handleShuffleSlot('bottoms')}
                disabled={lockBottom}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: lockBottom ? 'not-allowed' : 'pointer' }}
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>

          {/* Outerwear Slot */}
          <div className="flex-col align-center relative glass-card" style={{ padding: '8px', background: 'var(--color-bg-muted)' }}>
            <span className="text-xs text-muted font-bold" style={{ fontSize: '0.65rem' }}>ABRIGO (CAPA)</span>
            <div style={{ width: '80px', height: '80px', margin: '8px 0', position: 'relative' }}>
              {selectedOuter ? (
                selectedOuter.imageUrl ? (
                  <img 
                    src={selectedOuter.imageUrl} 
                    alt={selectedOuter.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                  />
                ) : (
                  <GarmentIcon category="outerwear" color={selectedOuter.color} size={28} />
                )
              ) : (
                <div className="flex-col align-center justify-center w-full h-full text-muted border-dashed border-2 rounded-xl" style={{ fontSize: '0.6rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)' }}>Sin abrigo</div>
              )}
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                onClick={() => setLockOuter(!lockOuter)} 
                style={{ background: 'none', border: 'none', color: lockOuter ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', cursor: 'pointer' }}
              >
                {lockOuter ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={() => handleShuffleSlot('outerwear')}
                disabled={lockOuter}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: lockOuter ? 'not-allowed' : 'pointer' }}
              >
                <Shuffle size={14} />
              </button>
            </div>
          </div>

          {/* Shoes Slot */}
          <div className="flex-col align-center relative glass-card" style={{ padding: '8px', background: 'var(--color-bg-muted)' }}>
            <span className="text-xs text-muted font-bold" style={{ fontSize: '0.65rem' }}>CALZADO (SHOES)</span>
            <div style={{ width: '80px', height: '80px', margin: '8px 0', position: 'relative' }}>
              {selectedShoe ? (
                selectedShoe.imageUrl ? (
                  <img 
                    src={selectedShoe.imageUrl} 
                    alt={selectedShoe.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                  />
                ) : (
                  <GarmentIcon category="shoes" color={selectedShoe.color} size={28} />
                )
              ) : (
                <div className="flex-col align-center justify-center w-full h-full text-muted border-dashed border-2 rounded-xl" style={{ fontSize: '0.6rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)' }}>Vacío</div>
              )}
            </div>
            
            <div className="flex-row gap-sm">
              <button 
                onClick={() => setLockShoe(!lockShoe)} 
                style={{ background: 'none', border: 'none', color: lockShoe ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', cursor: 'pointer' }}
              >
                {lockShoe ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={() => handleShuffleSlot('shoes')}
                disabled={lockShoe}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: lockShoe ? 'not-allowed' : 'pointer' }}
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
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            boxShadow: 'var(--shadow-sm)'
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
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Heart size={28} />
        </button>
      </div>
    </div>
  );
};
