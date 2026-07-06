import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { GarmentIcon } from './GarmentIcon';
import type { BackendOutfit, Garment } from '../types';
import { Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import { mapWeatherCode } from '../services/api';

export const OutfitHistory: React.FC = () => {
  const { outfitsHistory, fetchOutfitsHistory, closet, wearOutfit, discardOutfit, saveOutfit } = useApp();
  const [filter, setFilter] = useState<'all' | 'saved' | 'worn' | 'discarded'>('saved');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      await fetchOutfitsHistory(filter === 'all' ? undefined : filter);
      setIsLoading(false);
    };
    loadHistory();
  }, [filter]);

  // Resolves list of garments from garmentIds
  const getOutfitGarments = (backendOutfit: BackendOutfit): Garment[] => {
    return backendOutfit.garmentIds
      .map(id => closet.find(c => c.id === id))
      .filter((g): g is Garment => !!g);
  };

  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-col gap-md w-full">
      <div className="flex-col">
        <h3 className="title-medium text-gradient-primary">Historial & Combinaciones</h3>
        <p className="text-xs text-muted">Tus outfits creados por la IA y su estado de uso</p>
      </div>

      {/* Tabs */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '4px',
          width: '100%'
        }}
      >
        {[
          { id: 'saved', label: 'Guardados' },
          { id: 'worn', label: 'Usados (Historial)' },
          { id: 'discarded', label: 'Descartados' },
          { id: 'all', label: 'Todos' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`btn ${filter === tab.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ 
              padding: '6px 14px', 
              fontSize: '0.75rem', 
              width: 'auto',
              borderRadius: 'var(--radius-full)',
              flexShrink: 0
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading list state */}
      {isLoading ? (
        <div className="glass-card text-center flex-row align-center justify-center gap-sm" style={{ padding: '40px' }}>
          <RefreshCw className="animate-spin text-muted" size={20} />
          <span className="text-xs text-muted">Cargando outfits...</span>
        </div>
      ) : outfitsHistory.length > 0 ? (
        <div className="flex-col gap-md">
          {outfitsHistory.map(outfit => {
            const garments = getOutfitGarments(outfit);
            const weather = outfit.weatherContext;
            const wMapped = weather ? mapWeatherCode(weather.weatherCode) : null;

            return (
              <div key={outfit.id} className="glass-card flex-col gap-sm relative" style={{ padding: '16px' }}>
                
                {/* Header info */}
                <div className="flex-row justify-between align-center">
                  <span className="eco-badge" style={{ textTransform: 'capitalize' }}>
                    🏷️ {outfit.occasion || 'Diario'}
                  </span>
                  
                  <div className="flex-row align-center gap-xs text-muted" style={{ fontSize: '0.7rem' }}>
                    <Calendar size={12} />
                    <span>{formatDate(outfit.createdAt)}</span>
                  </div>
                </div>

                {/* Garments Grid preview */}
                <div className="flex-row gap-sm wrap mt-xs">
                  {garments.map(g => (
                    <div key={g.id} className="flex-col align-center gap-xs" style={{ width: '60px' }}>
                      <div style={{ width: '48px', height: '48px' }}>
                        <GarmentIcon category={g.category} color={g.color} size={18} />
                      </div>
                      <span className="text-xs text-muted text-center" style={{ fontSize: '0.55rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                        {g.name}
                      </span>
                    </div>
                  ))}
                  {garments.length === 0 && (
                    <span className="text-xs text-muted italic">Prendas de este outfit eliminadas del armario.</span>
                  )}
                </div>

                {/* Weather details */}
                {weather && (
                  <div className="flex-row align-center justify-between mt-xs" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', fontSize: '0.7rem' }}>
                    <span className="text-muted">
                      Clima: <strong style={{ color: 'var(--color-text-primary)' }}>{weather.temperatureC}°C</strong>, {wMapped?.condition}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.62rem' }}>
                      Lluvia: {weather.precipitationProbability}%
                    </span>
                  </div>
                )}

                {/* Actions depending on status */}
                <div className="flex-row gap-xs mt-sm justify-end">
                  {outfit.status === 'suggested' && (
                    <>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto' }}
                        onClick={() => discardOutfit(outfit.id)}
                      >
                        Descartar
                      </button>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto' }}
                        onClick={() => saveOutfit(outfit.id)}
                      >
                        Guardar
                      </button>
                    </>
                  )}
                  {outfit.status === 'saved' && (
                    <>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto' }}
                        onClick={() => discardOutfit(outfit.id)}
                      >
                        Descartar
                      </button>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto' }}
                        onClick={() => wearOutfit(outfit.id)}
                      >
                        Vestir Hoy
                      </button>
                    </>
                  )}
                  {outfit.status === 'worn' && (
                    <div className="flex-row align-center gap-xs text-muted" style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-success)' }}>
                      <ShieldCheck size={14} />
                      <span>¡Vestido hoy!</span>
                    </div>
                  )}
                  {outfit.status === 'discarded' && (
                    <span className="text-xs text-muted italic" style={{ fontSize: '0.65rem' }}>Outfit descartado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card text-center" style={{ padding: '40px' }}>
          <p className="text-sm text-muted">No se encontraron outfits guardados en esta categoría.</p>
        </div>
      )}
    </div>
  );
};
