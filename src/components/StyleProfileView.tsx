import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Check, RefreshCw, Sparkles, X, Plus } from 'lucide-react';

interface StyleProfileViewProps {
  onClose?: () => void;
}

export const StyleProfileView: React.FC<StyleProfileViewProps> = ({ onClose }) => {
  const { styleProfile, updateStyleProfile } = useApp();
  const [sizes, setSizes] = useState({ top: '', bottom: '', shoes: '' });
  const [occasions, setOccasions] = useState<string[]>([]);
  const [goals, setGoals] = useState<string>('');
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New item inputs
  const [newOccasion, setNewOccasion] = useState('');
  const [newColor, setNewColor] = useState('#6d28d9');

  // Load from styleProfile
  useEffect(() => {
    if (styleProfile) {
      setSizes({
        top: styleProfile.sizes?.top || '',
        bottom: styleProfile.sizes?.bottom || '',
        shoes: styleProfile.sizes?.shoes || ''
      });
      setOccasions(styleProfile.occasions || []);
      setGoals(styleProfile.goals || '');
      setFavoriteColors(styleProfile.favoriteColors || []);
    }
  }, [styleProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateStyleProfile({
        sizes,
        occasions,
        goals,
        favoriteColors
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOccasion = () => {
    if (newOccasion.trim() && !occasions.includes(newOccasion.trim())) {
      setOccasions([...occasions, newOccasion.trim()]);
      setNewOccasion('');
    }
  };

  const handleRemoveOccasion = (occ: string) => {
    setOccasions(occasions.filter(o => o !== occ));
  };

  const handleAddColor = () => {
    if (newColor && !favoriteColors.includes(newColor)) {
      setFavoriteColors([...favoriteColors, newColor]);
    }
  };

  const handleRemoveColor = (col: string) => {
    setFavoriteColors(favoriteColors.filter(c => c !== col));
  };

  return (
    <div className="flex-col gap-md w-full" style={{ padding: '4px' }}>
      <div className="flex-row align-center justify-between">
        <div className="flex-row align-center gap-xs">
          <div className="logo-glow" style={{ width: '32px', height: '32px' }}>
            <User size={16} style={{ color: '#fff' }} />
          </div>
          <h3 className="title-medium text-gradient-primary">Perfil de Estilo</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <p className="text-xs text-muted">
        Personaliza tus preferencias para que nuestro motor de estilo de IA adapte mejor las combinaciones automáticas.
      </p>

      {/* Sizes Section */}
      <div className="glass-card flex-col gap-sm">
        <h4 className="text-xs font-bold text-gradient-primary">Tallas Recomendadas</h4>
        <div className="grid-3">
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.65rem' }}>Superior (Top)</label>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="Ej. M, 38" 
              value={sizes.top}
              onChange={(e) => setSizes({ ...sizes, top: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.65rem' }}>Inferior (Bottom)</label>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="Ej. 30, 32" 
              value={sizes.bottom}
              onChange={(e) => setSizes({ ...sizes, bottom: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.65rem' }}>Calzado (Shoes)</label>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="Ej. 38, 39" 
              value={sizes.shoes}
              onChange={(e) => setSizes({ ...sizes, shoes: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Occasions Section */}
      <div className="glass-card flex-col gap-sm">
        <h4 className="text-xs font-bold text-gradient-primary">Ocasiones de Uso Frecuentes</h4>
        
        <div className="flex-row gap-xs wrap mt-xs">
          {occasions.map((occ, i) => (
            <span 
              key={i} 
              className="eco-badge flex-row align-center gap-xs"
              style={{ padding: '4px 10px', fontSize: '0.7rem', textTransform: 'capitalize' }}
            >
              {occ}
              <button 
                type="button" 
                onClick={() => handleRemoveOccasion(occ)}
                style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          {occasions.length === 0 && (
            <span className="text-xs text-muted">Aún no has agregado ocasiones.</span>
          )}
        </div>

        <div className="flex-row gap-xs mt-sm w-full">
          <input 
            type="text" 
            className="input-glass" 
            placeholder="Nueva ocasión (ej. universidad)" 
            value={newOccasion}
            onChange={(e) => setNewOccasion(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem' }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddOccasion()}
          />
          <button 
            type="button" 
            className="btn btn-outline"
            style={{ width: '40px', padding: 0, borderRadius: 'var(--radius-sm)' }}
            onClick={handleAddOccasion}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Goals Section */}
      <div className="glass-card flex-col gap-sm">
        <h4 className="text-xs font-bold text-gradient-primary">Objetivo de Estilo</h4>
        <div className="form-group">
          <input 
            type="text" 
            className="input-glass" 
            placeholder="Ej. Verse más formal y juvenil" 
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </div>
      </div>

      {/* Favorite Colors Section */}
      <div className="glass-card flex-col gap-sm">
        <h4 className="text-xs font-bold text-gradient-primary">Colores Favoritos</h4>
        
        <div className="flex-row gap-sm align-center wrap mt-xs">
          {favoriteColors.map((col, i) => (
            <div 
              key={i} 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: col, 
                position: 'relative',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <button 
                type="button" 
                onClick={() => handleRemoveColor(col)}
                style={{ 
                  position: 'absolute', 
                  top: '-4px', 
                  right: '-4px', 
                  background: 'var(--color-error)', 
                  border: 'none', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '14px', 
                  height: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '8px',
                  cursor: 'pointer'
                }}
              >
                <X size={8} />
              </button>
            </div>
          ))}
          {favoriteColors.length === 0 && (
            <span className="text-xs text-muted">Agrega tus colores favoritos.</span>
          )}
        </div>

        <div className="flex-row gap-xs mt-sm align-center">
          <input 
            type="color" 
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <button 
            type="button" 
            className="btn btn-outline"
            style={{ padding: '8px 12px', fontSize: '0.75rem', width: 'auto' }}
            onClick={handleAddColor}
          >
            Añadir Color
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex-row gap-sm mt-sm">
        <button 
          className="btn btn-primary"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Guardando Perfil...
            </>
          ) : saveSuccess ? (
            <>
              <Check size={16} />
              ¡Guardado con éxito!
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
};
