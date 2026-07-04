import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { GarmentCategory } from '../types';
import { GarmentIcon } from '../components/GarmentIcon';
import { Plus, Trash2, AlertTriangle, Sparkles, X, RefreshCw, Upload, Check } from 'lucide-react';

export const Closet: React.FC = () => {
  const { closet, user, addGarment, deleteGarment, simulateBgRemoval, setActiveTab } = useApp();
  const [filterCategory, setFilterCategory] = useState<GarmentCategory | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form states for uploading custom item
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('tops');
  const [color, setColor] = useState('#a78bfa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  const filteredCloset = filterCategory === 'all' 
    ? closet 
    : closet.filter(item => item.category === filterCategory);

  const handleOpenAddModal = () => {
    setName('');
    setCategory('tops');
    setColor('#e9d5ff');
    setIsProcessed(false);
    setIsProcessing(false);
    setIsAddModalOpen(true);
  };

  const handleSimulateScan = async () => {
    if (!name.trim()) return;
    setIsProcessing(true);
    await simulateBgRemoval('custom_upload');
    setIsProcessing(false);
    setIsProcessed(true);
  };

  const handleSaveItem = async () => {
    if (!isProcessed || !name.trim()) return;
    
    const success = await addGarment({
      name,
      category,
      color,
      imageUrl: 'custom_upload',
      hasBgRemoved: true
    });

    if (success) {
      setIsAddModalOpen(false);
    } else {
      alert('Llegaste al límite del Plan Free. Actualiza a Style Pro para subir prendas ilimitadas.');
    }
  };

  const getLimitColor = () => {
    const ratio = closet.length / 20;
    if (ratio >= 0.9) return 'hsl(var(--error))';
    if (ratio >= 0.7) return 'hsl(var(--accent))';
    return 'hsl(var(--primary))';
  };

  return (
    <div className="flex-col gap-md">
      {/* Title & Limits */}
      <div className="flex-row align-center justify-between">
        <div className="flex-col">
          <h2 className="title-medium text-gradient-primary">Tu Armario Digital</h2>
          <p className="text-xs text-muted">Colección de prendas recortadas por IA</p>
        </div>

        {user.plan === 'free' ? (
          <div className="flex-col align-end gap-xs">
            <span className="text-xs font-medium">Límite Free:</span>
            <span className="text-sm font-bold" style={{ color: getLimitColor() }}>
              {closet.length} / 20
            </span>
          </div>
        ) : (
          <div className="eco-badge">
            ✨ Clóset Ilimitado (Pro)
          </div>
        )}
      </div>

      {/* Filter Category Scroll */}
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
          { id: 'all', label: 'Todos' },
          { id: 'tops', label: 'Tops' },
          { id: 'bottoms', label: 'Bottoms' },
          { id: 'outerwear', label: 'Abrigos' },
          { id: 'shoes', label: 'Calzado' },
          { id: 'accessories', label: 'Accs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id as any)}
            className={`btn ${filterCategory === tab.id ? 'btn-primary' : 'btn-outline'}`}
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

      {/* Limit alert warning */}
      {user.plan === 'free' && closet.length >= 18 && (
        <div className="glass-card flex-row align-center gap-sm" style={{ borderLeft: '4px solid hsl(var(--error))', padding: '12px' }}>
          <AlertTriangle size={18} style={{ color: 'hsl(var(--error))', flexShrink: 0 }} />
          <div className="flex-col">
            <span className="text-xs font-bold" style={{ color: 'hsl(var(--error))' }}>¡Casi al límite de tu clóset!</span>
            <span className="text-xs text-muted">Actualiza a Style Pro para registrar prendas ilimitadas.</span>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto', marginLeft: 'auto' }}
            onClick={() => setActiveTab('plans')}
          >
            Subir
          </button>
        </div>
      )}

      {/* Wardrobe Grid */}
      {filteredCloset.length > 0 ? (
        <div className="grid-2">
          {filteredCloset.map(item => (
            <div key={item.id} className="glass-card flex-col align-center relative" style={{ padding: '12px' }}>
              <div style={{ width: '100%', height: '110px', position: 'relative' }}>
                <GarmentIcon category={item.category} color={item.color} size={36} />
                
                {/* Delete button */}
                <button
                  onClick={() => deleteGarment(item.id)}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="mt-sm w-full text-center">
                <span className="text-xs font-bold" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
                <span className="text-xs text-muted" style={{ textTransform: 'capitalize', fontSize: '0.65rem' }}>
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center" style={{ padding: '40px' }}>
          <p className="text-sm text-muted">No se encontraron prendas en esta categoría.</p>
        </div>
      )}

      {/* Floating Add Button */}
      <button 
        className="btn btn-primary pulse-glow-effect"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          padding: 0,
          zIndex: 50,
          boxShadow: '0 8px 24px rgba(109, 40, 217, 0.5)'
        }}
        onClick={handleOpenAddModal}
        disabled={user.plan === 'free' && closet.length >= 20}
      >
        <Plus size={24} />
      </button>

      {/* Upload/Digitize Modal */}
      {isAddModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-card w-full" style={{ maxWidth: '400px', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h3 className="title-medium text-gradient-primary flex-row align-center gap-xs mb-sm">
              <Sparkles size={18} />
              Añadir Prenda
            </h3>
            <p className="text-xs text-muted mb-md">El **Visual Agent** procesará tu prenda para eliminar el fondo de manera inteligente.</p>

            <div className="flex-col gap-sm">
              <div className="form-group">
                <label className="form-label">Nombre de la Prenda</label>
                <input 
                  type="text" 
                  className="input-glass"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Falda de Cuero Café"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select 
                    className="input-glass"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                    style={{ background: 'hsl(var(--bg-card))' }}
                  >
                    <option value="tops">Top / Blusa</option>
                    <option value="bottoms">Pantalón / Falda</option>
                    <option value="outerwear">Abrigo / Saco</option>
                    <option value="shoes">Calzado</option>
                    <option value="accessories">Accesorios</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Color de la Prenda</label>
                  <div className="flex-row align-center gap-sm">
                    <input 
                      type="color" 
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ border: 'none', background: 'none', width: '40px', height: '40px', cursor: 'pointer' }}
                    />
                    <span className="text-xs font-bold" style={{ textTransform: 'uppercase' }}>{color}</span>
                  </div>
                </div>
              </div>

              {/* Scanning Workspace */}
              <div 
                className="flex-col align-center justify-center relative overflow-hidden" 
                style={{ 
                  height: '140px', 
                  borderRadius: '12px', 
                  background: 'hsla(var(--border-color), 0.3)',
                  border: '1px dashed hsla(var(--border-color), 1)'
                }}
              >
                {isProcessing ? (
                  <div className="flex-col align-center gap-xs">
                    <RefreshCw className="animate-spin text-muted" size={24} style={{ color: 'hsl(var(--primary))' }} />
                    <span className="text-xs text-muted">Eliminando fondo...</span>
                    <div className="scanning-bar" />
                  </div>
                ) : isProcessed ? (
                  <div className="flex-col align-center gap-sm">
                    <div style={{ width: '60px', height: '60px' }}>
                      <GarmentIcon category={category} color={color} size={24} />
                    </div>
                    <span className="eco-badge">
                      <Check size={12} /> Recorte Completado
                    </span>
                  </div>
                ) : (
                  <button 
                    className="btn btn-outline" 
                    style={{ width: 'fit-content' }}
                    onClick={handleSimulateScan}
                    disabled={!name.trim()}
                  >
                    <Upload size={14} />
                    Escanear Foto con IA
                  </button>
                )}
              </div>

              {/* Save / Actions */}
              <div className="flex-row gap-sm mt-md">
                <button 
                  className="btn btn-outline" 
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary" 
                  disabled={!isProcessed}
                  onClick={handleSaveItem}
                >
                  Añadir al Clóset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
