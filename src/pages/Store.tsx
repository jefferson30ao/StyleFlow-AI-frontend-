import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GarmentIcon } from '../components/GarmentIcon';
import type { StoreItem } from '../types';
import { ExternalLink, ShoppingBag, Leaf, CheckCircle } from 'lucide-react';

export const Store: React.FC = () => {
  const { storeItems } = useApp();
  const [redirectingItem, setRedirectingItem] = useState<StoreItem | null>(null);

  const handleSimulateRedirect = (item: StoreItem) => {
    setRedirectingItem(item);
    
    // Simulate redirection and close after 2.5s
    setTimeout(() => {
      setRedirectingItem(null);
      window.open(item.link, '_blank');
    }, 2500);
  };

  return (
    <div className="flex-col gap-md">
      {/* Title */}
      <div className="flex-col">
        <h2 className="title-medium text-gradient-secondary flex-row align-center gap-xs">
          <Leaf size={20} style={{ color: 'var(--color-success)' }} />
          Tienda Circular Sostenible
        </h2>
        <p className="text-xs text-muted">Prendas ecológicas y marcas aliadas en Lima Metropolitana</p>
      </div>



      {/* Store list */}
      <div className="flex-col gap-md">
        {storeItems.map(item => (
          <div key={item.id} className="glass-card flex-row gap-md align-center" style={{ padding: '12px' }}>
            {/* Visual Icon Box */}
            <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              {item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/')) ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <GarmentIcon 
                  category={item.category} 
                  color={
                    item.id === 's1' ? '#93c5fd' : // celeste lino
                    item.id === 's2' ? '#d1fae5' : // culotte beige/menta
                    item.id === 's3' ? '#34d399' : // eco-nylon verde
                    '#fca5a5'                      // canvas rosa/beige
                  } 
                  size={24} 
                />
              )}
            </div>

            {/* Info details */}
            <div className="flex-col flex-1 gap-xs" style={{ minWidth: 0 }}>
              <div className="flex-row align-center justify-between">
                <span className="text-xs text-muted font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.brand}
                </span>
                <span className="text-sm font-bold text-gradient-secondary">
                  S/. {item.price.toFixed(2)}
                </span>
              </div>
              
              <h3 className="text-sm font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </h3>

              <div className="flex-row gap-xs mt-xs">
                <span className="eco-badge">
                  🌱 {item.ecoFeature}
                </span>
                <span className="text-xs text-muted" style={{ fontSize: '0.62rem', alignSelf: 'center' }}>
                  Comisión: ~8%
                </span>
              </div>
            </div>

            {/* Redirect action */}
            <button 
              className="btn btn-outline"
              style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
              onClick={() => handleSimulateRedirect(item)}
            >
              <ExternalLink size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Redirection Toast Simulator */}
      {redirectingItem && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--color-overlay)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-card text-center flex-col align-center gap-md" style={{ maxWidth: '360px' }}>
            <div className="logo-glow animate-spin" style={{ background: 'var(--color-success)', width: '56px', height: '56px', borderRadius: '50%' }}>
              <ShoppingBag size={24} style={{ color: '#fff' }} />
            </div>

            <div className="flex-col gap-xs">
              <h3 className="text-sm font-bold">Redireccionando a la Tienda Oficial</h3>
              <p className="text-xs text-muted">Conectando de forma segura con <strong>{redirectingItem.brand}</strong>...</p>
            </div>

            <div className="glass-card flex-row align-center gap-xs" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--badge-eco-border)', padding: '10px' }}>
              <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />
              <span className="text-xs text-muted">
                StyleFlow AI registrará una comisión estimada de <strong>S/. {(redirectingItem.price * 0.08).toFixed(2)}</strong>.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
