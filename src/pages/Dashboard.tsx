import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GarmentIcon } from '../components/GarmentIcon';
import { Cloud, CloudRain, Sun, Compass, Briefcase, GraduationCap, Heart, Sparkles, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    currentWeather, 
    currentAgenda, 
    setCurrentAgenda,
    recommendedOutfit, 
    feedbackOutfit, 
    setActiveTab 
  } = useApp();

  const [liked, setLiked] = useState<boolean | null>(null);

  return (
    <div className="flex-col gap-md">
      {/* Greetings Card */}
      <div className="flex-row align-center justify-between">
        <div className="flex-col">
          <span className="text-xs text-muted">¡Hola, {user.name}!</span>
          <h2 className="title-medium text-gradient-primary">Outfit del Día</h2>
        </div>
        <div 
          className="eco-badge animate-pulse" 
          style={{ textTransform: 'capitalize', cursor: 'pointer' }}
          onClick={() => setActiveTab('plans')}
        >
          Plan {user.plan}
        </div>
      </div>

      {/* Weather in Lima Card */}
      <div className="glass-card flex-row align-center justify-between" style={{ borderLeft: '4px solid hsl(var(--primary))' }}>
        <div className="flex-col gap-xs">
          <div className="flex-row align-center gap-xs">
            <Compass size={14} className="text-muted" />
            <span className="text-xs text-muted">LIMA METROPOLITANA</span>
          </div>
          <h3 className="title-medium" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            {currentWeather.temp}°C
            <span className="text-xs text-muted font-medium">Humedad 94%</span>
          </h3>
          <p className="text-xs font-bold text-gradient-primary">{currentWeather.condition}</p>
        </div>
        
        <div style={{ color: 'hsl(var(--primary))' }}>
          {currentWeather.id === 'sunny' ? (
            <Sun size={42} className="floating-effect" />
          ) : currentWeather.id === 'cloudy' ? (
            <Cloud size={42} className="floating-effect" />
          ) : (
            <CloudRain size={42} className="floating-effect" />
          )}
        </div>
      </div>

      {/* Agenda selector */}
      <div className="flex-col gap-xs">
        <span className="text-xs font-medium text-muted">¿Cuál es tu agenda de hoy?</span>
        <div className="grid-2">
          <button 
            className={`btn ${currentAgenda === 'work' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '10px', fontSize: '0.8rem' }}
            onClick={() => setCurrentAgenda('work')}
          >
            <Briefcase size={14} />
            Trabajo / Oficina
          </button>
          <button 
            className={`btn ${currentAgenda === 'college' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '10px', fontSize: '0.8rem' }}
            onClick={() => setCurrentAgenda('college')}
          >
            <GraduationCap size={14} />
            UNMSM / Clases
          </button>
          <button 
            className={`btn ${currentAgenda === 'date' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '10px', fontSize: '0.8rem' }}
            onClick={() => setCurrentAgenda('date')}
          >
            <Heart size={14} />
            Cena / Salida Noche
          </button>
          <button 
            className={`btn ${currentAgenda === 'casual' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '10px', fontSize: '0.8rem' }}
            onClick={() => setCurrentAgenda('casual')}
          >
            <Compass size={14} />
            Salida Casual / Día
          </button>
        </div>
      </div>

      {/* Recommended Outfit Box */}
      {recommendedOutfit ? (
        <div className="glass-card flex-col gap-md relative">
          <div className="flex-row align-center justify-between">
            <span className="ai-badge">
              <Sparkles size={12} />
              Recomendación de IA
            </span>
            <span className="text-xs text-muted" style={{ fontWeight: 500 }}>
              {recommendedOutfit.name}
            </span>
          </div>

          {/* Outfit grid */}
          <div className="grid-3 mt-xs">
            {/* Tops */}
            <div className="flex-col align-center gap-xs">
              <div style={{ width: '80px', height: '80px' }}>
                <GarmentIcon category="tops" color={recommendedOutfit.tops.color} size={28} />
              </div>
              <span className="text-xs text-muted text-center" style={{ fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', height: '14px', width: '100%' }}>
                {recommendedOutfit.tops.name}
              </span>
            </div>

            {/* Bottoms */}
            <div className="flex-col align-center gap-xs">
              <div style={{ width: '80px', height: '80px' }}>
                <GarmentIcon category="bottoms" color={recommendedOutfit.bottoms.color} size={28} />
              </div>
              <span className="text-xs text-muted text-center" style={{ fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', height: '14px', width: '100%' }}>
                {recommendedOutfit.bottoms.name}
              </span>
            </div>

            {/* Shoes */}
            <div className="flex-col align-center gap-xs">
              <div style={{ width: '80px', height: '80px' }}>
                <GarmentIcon category="shoes" color={recommendedOutfit.shoes.color} size={28} />
              </div>
              <span className="text-xs text-muted text-center" style={{ fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', height: '14px', width: '100%' }}>
                {recommendedOutfit.shoes.name}
              </span>
            </div>
          </div>

          {recommendedOutfit.outerwear && (
            <div className="flex-row align-center justify-center gap-md" style={{ borderTop: '1px solid hsla(var(--border-color), 0.5)', paddingTop: '10px' }}>
              <span className="text-xs text-muted font-bold">Capa sugerida (Clima):</span>
              <div className="flex-row align-center gap-sm">
                <div style={{ width: '32px', height: '32px' }}>
                  <GarmentIcon category="outerwear" color={recommendedOutfit.outerwear.color} size={14} />
                </div>
                <span className="text-xs font-medium">{recommendedOutfit.outerwear.name}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted text-center italic" style={{ padding: '0 8px' }}>
            "{recommendedOutfit.description}"
          </p>

          {/* Feedback actions */}
          <div className="flex-row align-center justify-between" style={{ borderTop: '1px solid hsla(var(--border-color), 0.8)', paddingTop: '12px' }}>
            <span className="text-xs text-muted">¿Te gusta este outfit?</span>
            <div className="flex-row gap-sm">
              <button 
                className={`btn btn-outline ${liked === true ? 'pulse-glow-effect' : ''}`}
                style={{ width: 'fit-content', padding: '6px 12px', border: liked === true ? '1px solid hsl(var(--secondary))' : '' }}
                onClick={() => {
                  setLiked(true);
                  feedbackOutfit(recommendedOutfit.id, 'like');
                }}
              >
                👍 Sí
              </button>
              <button 
                className={`btn btn-outline ${liked === false ? 'pulse-glow-effect' : ''}`}
                style={{ width: 'fit-content', padding: '6px 12px', border: liked === false ? '1px solid hsl(var(--error))' : '' }}
                onClick={() => {
                  setLiked(false);
                  feedbackOutfit(recommendedOutfit.id, 'dislike');
                }}
              >
                👎 No
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card text-center py-lg">
          <AlertCircle size={32} className="text-muted" style={{ margin: '0 auto' }} />
          <p className="text-sm text-muted mt-sm">No hay outfits disponibles. Digitaliza más prendas para habilitar las sugerencias.</p>
          <button className="btn btn-primary mt-md" onClick={() => setActiveTab('closet')}>
            Ir a Armario
          </button>
        </div>
      )}

      {/* Sustainable tip */}
      <div className="glass-card flex-row align-center gap-md" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(23, 27, 38, 0.6) 100%)', borderColor: 'hsla(var(--secondary), 0.3)' }}>
        <div className="logo-glow" style={{ background: 'hsl(var(--secondary))', flexShrink: 0, width: '36px', height: '36px' }}>
          🌱
        </div>
        <div className="flex-col">
          <h4 className="text-xs font-bold text-gradient-secondary">Consejo de Moda Sostenible</h4>
          <p className="text-xs text-muted">
            Este outfit utiliza tu ropa existente, reduciendo en 4.5kg tu huella de carbono de hoy al evitar compras rápidas.
          </p>
        </div>
      </div>
    </div>
  );
};
