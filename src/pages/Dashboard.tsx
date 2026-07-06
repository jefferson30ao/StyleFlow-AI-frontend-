import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GarmentIcon } from '../components/GarmentIcon';
import { StyleProfileView } from '../components/StyleProfileView';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Compass, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Sparkles, 
  AlertCircle, 
  MapPin, 
  Check, 
  RefreshCw, 
  User, 
  LogOut 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    currentWeather, 
    currentAgenda, 
    setCurrentAgenda,
    recommendedOutfit, 
    generateRecommendations,
    isGeneratingRecs,
    recsError,
    saveOutfit,
    wearOutfit,
    discardOutfit,
    gpsAllowed,
    requestGps,
    logout,
    setActiveTab 
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string>('');

  // Handle GPS permission click
  const handleEnableGps = async () => {
    const success = await requestGps();
    if (success) {
      setActionFeedback('Ubicación GPS obtenida con éxito.');
      setTimeout(() => setActionFeedback(''), 3000);
    }
  };

  const handleAction = async (type: 'save' | 'wear' | 'discard', outfitId: string) => {
    setActionFeedback('');
    try {
      if (type === 'save') {
        await saveOutfit(outfitId);
        setActionFeedback('¡Outfit guardado en tus favoritos!');
      } else if (type === 'wear') {
        await wearOutfit(outfitId);
        setActionFeedback('¡Excelente! Se registró en tu historial y se actualizó tu armario.');
      } else if (type === 'discard') {
        await discardOutfit(outfitId);
        setActionFeedback('Outfit descartado de las sugerencias.');
      }
      setTimeout(() => setActionFeedback(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Re-generate recommendations manually
  const handleRefreshRecommendations = () => {
    generateRecommendations();
  };

  return (
    <div className="flex-col gap-md">
      
      {/* Greetings Card & Profile triggers */}
      <div className="flex-row align-center justify-between">
        <div className="flex-col">
          <span className="text-xs text-muted">¡Hola, {user?.name || 'Valeria'}!</span>
          <h2 className="title-medium text-gradient-primary">Outfit del Día</h2>
        </div>
        
        <div className="flex-row gap-xs align-center">
          <button 
            className="btn btn-outline"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
            onClick={() => setIsProfileOpen(true)}
            title="Mi Perfil de Estilo"
          >
            <User size={16} />
          </button>
          
          <button 
            className="btn btn-outline"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            onClick={logout}
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Geolocation & Weather in Lima Card */}
      <div className="glass-card flex-row align-center justify-between" style={{ borderLeft: '4px solid var(--color-accent-champagne)', padding: '16px' }}>
        <div className="flex-col gap-xs flex-1">
          <div className="flex-row align-center gap-xs">
            <MapPin size={14} style={{ color: gpsAllowed ? 'var(--color-success)' : 'var(--color-text-tertiary)' }} />
            <span className="text-xs text-muted" style={{ fontWeight: 600 }}>
              {gpsAllowed ? 'LIMA METROPOLITANA (GPS ACTIVO)' : 'LIMA (Ubicación no obtenida)'}
            </span>
          </div>
          
          {gpsAllowed ? (
            <>
              <h3 className="title-medium" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '4px', margin: '4px 0' }}>
                {currentWeather.temp}°C
                <span className="text-xs text-muted font-medium">Humedad 94%</span>
              </h3>
              <p className="text-xs font-bold text-gradient-primary">{currentWeather.condition}</p>
            </>
          ) : (
            <div className="flex-col gap-xs mt-xs">
              <p className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>Permite el acceso al GPS para obtener recomendaciones de outfits exactas para tu clima.</p>
              <button 
                className="btn btn-primary" 
                style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'fit-content' }}
                onClick={handleEnableGps}
              >
                Activar Ubicación Real
              </button>
            </div>
          )}
        </div>
        
        {gpsAllowed && (
          <div style={{ color: 'var(--color-action-primary-bg)' }}>
            {currentWeather.id === 'sunny' ? (
              <Sun size={42} className="floating-effect" />
            ) : currentWeather.id === 'cloudy' ? (
              <Cloud size={42} className="floating-effect" />
            ) : (
              <CloudRain size={42} className="floating-effect" />
            )}
          </div>
        )}
      </div>

      {/* Agenda selector */}
      <div className="flex-col gap-xs">
        <div className="flex-row align-center justify-between">
          <span className="text-xs font-medium text-muted">¿Cuál es tu agenda de hoy?</span>
          {gpsAllowed && (
            <button 
              className="btn btn-outline flex-row align-center gap-xs"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.65rem' }}
              onClick={handleRefreshRecommendations}
              disabled={isGeneratingRecs}
            >
              <RefreshCw size={10} className={isGeneratingRecs ? 'animate-spin' : ''} />
              Refrescar
            </button>
          )}
        </div>
        
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
            clases
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

      {/* Action Feedbacks */}
      {actionFeedback && (
        <div className="glass-card flex-row align-center gap-xs animate-fade-in" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--badge-eco-border)', padding: '10px' }}>
          <Check size={14} style={{ color: 'var(--color-success)' }} />
          <span className="text-xs text-muted">{actionFeedback}</span>
        </div>
      )}

      {recsError && (
        <div className="glass-card flex-row align-center gap-xs" style={{ borderLeft: '4px solid var(--color-error)', padding: '10px', background: 'var(--color-error-bg)' }}>
          <AlertCircle size={14} style={{ color: 'var(--color-error)' }} />
          <span className="text-xs" style={{ color: 'var(--color-error)' }}>{recsError}</span>
        </div>
      )}

      {/* Recommended Outfit Box */}
      {isGeneratingRecs ? (
        <div className="glass-card text-center flex-col align-center gap-md py-lg">
          <RefreshCw className="animate-spin text-muted" size={32} style={{ color: 'var(--color-action-primary-bg)' }} />
          <span className="text-xs text-muted">Buscando prendas en tu clóset y analizando el clima limeño...</span>
        </div>
      ) : recommendedOutfit ? (
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
                {recommendedOutfit.tops.imageUrl ? (
                  <img 
                    src={recommendedOutfit.tops.imageUrl} 
                    alt={recommendedOutfit.tops.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                ) : (
                  <GarmentIcon category="tops" color={recommendedOutfit.tops.color} size={28} />
                )}
              </div>
              <span className="text-xs text-muted text-center" style={{ fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', height: '14px', width: '100%', whiteSpace: 'nowrap' }}>
                {recommendedOutfit.tops.name}
              </span>
            </div>

            {/* Bottoms */}
            <div className="flex-col align-center gap-xs">
              <div style={{ width: '80px', height: '80px' }}>
                {recommendedOutfit.bottoms.imageUrl ? (
                  <img 
                    src={recommendedOutfit.bottoms.imageUrl} 
                    alt={recommendedOutfit.bottoms.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                ) : (
                  <GarmentIcon category="bottoms" color={recommendedOutfit.bottoms.color} size={28} />
                )}
              </div>
              <span className="text-xs text-muted text-center" style={{ fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', height: '14px', width: '100%', whiteSpace: 'nowrap' }}>
                {recommendedOutfit.bottoms.name}
              </span>
            </div>

            {/* Shoes */}
            <div className="flex-col align-center gap-xs">
              <div style={{ width: '80px', height: '80px' }}>
                {recommendedOutfit.shoes.imageUrl ? (
                  <img 
                    src={recommendedOutfit.shoes.imageUrl} 
                    alt={recommendedOutfit.shoes.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                  />
                ) : (
                  <GarmentIcon category="shoes" color={recommendedOutfit.shoes.color} size={28} />
                )}
              </div>
              <span className="text-xs text-muted text-center" style={{ fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', height: '14px', width: '100%', whiteSpace: 'nowrap' }}>
                {recommendedOutfit.shoes.name}
              </span>
            </div>
          </div>

          {recommendedOutfit.outerwear && (
            <div className="flex-row align-center justify-center gap-md" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
              <span className="text-xs text-muted font-bold">Capa sugerida (Clima):</span>
              <div className="flex-row align-center gap-sm">
                <div style={{ width: '32px', height: '32px' }}>
                  {recommendedOutfit.outerwear.imageUrl ? (
                    <img 
                      src={recommendedOutfit.outerwear.imageUrl} 
                      alt={recommendedOutfit.outerwear.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                    />
                  ) : (
                    <GarmentIcon category="outerwear" color={recommendedOutfit.outerwear.color} size={14} />
                  )}
                </div>
                <span className="text-xs font-medium">{recommendedOutfit.outerwear.name}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted text-center italic" style={{ padding: '0 8px' }}>
            "{recommendedOutfit.description}"
          </p>

          {/* Outfit Real Actions */}
          <div className="flex-row gap-xs justify-center mt-sm pt-sm" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button 
              className="btn btn-outline"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem' }}
              onClick={() => handleAction('discard', recommendedOutfit.id)}
            >
              Descartar
            </button>
            <button 
              className="btn btn-secondary"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem' }}
              onClick={() => handleAction('save', recommendedOutfit.id)}
            >
              Guardar
            </button>
            <button 
              className="btn btn-primary"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem' }}
              onClick={() => handleAction('wear', recommendedOutfit.id)}
            >
              Vestir Hoy
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card text-center py-lg">
          <AlertCircle size={32} className="text-muted" style={{ margin: '0 auto' }} />
          <p className="text-sm text-muted mt-sm">No hay outfits sugeridos. Digitaliza más prendas en tu armario para que la IA arme combinaciones.</p>
          <button className="btn btn-primary mt-md" onClick={() => setActiveTab('closet')}>
            Ir a Armario
          </button>
        </div>
      )}

      {/* Sustainable tip */}
      <div className="glass-card flex-row align-center gap-md" style={{ background: '#FFFFFF', borderColor: 'var(--badge-eco-border)' }}>
        <div className="logo-glow" style={{ background: 'var(--color-success)', flexShrink: 0, width: '36px', height: '36px' }}>
          🌱
        </div>
        <div className="flex-col">
          <h4 className="text-xs font-bold text-gradient-secondary">Consejo de Moda Sostenible</h4>
          <p className="text-xs text-muted">
            Este outfit utiliza tu ropa existente, reduciendo en 4.5kg tu huella de carbono de hoy al evitar compras rápidas.
          </p>
        </div>
      </div>

      {/* Style Profile Modal */}
      {isProfileOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--color-overlay)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div className="glass-card w-full" style={{ maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', padding: '24px' }}>
            <StyleProfileView onClose={() => setIsProfileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
