import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { GarmentCategory, Garment } from '../types';
import { GarmentIcon } from '../components/GarmentIcon';
import { OutfitHistory } from '../components/OutfitHistory';
import { api } from '../services/api';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  RefreshCw, 
  Upload, 
  Check, 
  Edit2, 
  Calendar, 
  Info, 
  Award 
} from 'lucide-react';

export const Closet: React.FC = () => {
  const { 
    closet, 
    user, 
    deleteGarment, 
    uploadGarmentFile, 
    confirmGarment,
    fetchCloset,
    setActiveTab 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'garments' | 'history'>('garments');
  const [filterCategory, setFilterCategory] = useState<GarmentCategory | 'all'>('all');
  
  // Add Garment Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageKey, setImageKey] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory>('tops');
  const [subcategory, setSubcategory] = useState('');
  const [color, setColor] = useState('#a78bfa');
  const [secondaryColors, setSecondaryColors] = useState<string>('');
  const [style, setStyle] = useState('casual');
  const [season, setSeason] = useState<string[]>(['verano']);
  const [material, setMaterial] = useState('');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Garment Detail / Edit Modal states
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState<GarmentCategory>('tops');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editColor, setEditColor] = useState('#a78bfa');
  const [editStyle, setEditStyle] = useState('casual');
  const [editMaterial, setEditMaterial] = useState('');
  const [editSeason, setEditSeason] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const filteredCloset = filterCategory === 'all' 
    ? closet 
    : closet.filter(item => item.category === filterCategory);

  const handleOpenAddModal = () => {
    setSelectedFile(null);
    setImageKey('');
    setName('');
    setCategory('tops');
    setSubcategory('');
    setColor('#e9d5ff');
    setSecondaryColors('');
    setStyle('casual');
    setSeason(['verano']);
    setMaterial('');
    setAiConfidence(null);
    setUploadError('');
    setIsProcessed(false);
    setIsUploading(false);
    setIsAddModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError('');
      handleUploadAndClassify(file);
    }
  };

  const handleUploadAndClassify = async (file: File) => {
    setIsUploading(true);
    setUploadError('');
    try {
      const classificationResult = await uploadGarmentFile(file);
      
      setImageKey(classificationResult.imageKey);
      
      const classification = classificationResult.classification;
      if (classification) {
        // Pre-fill fields with AI response
        setCategory(classification.category === 'top' ? 'tops' : 
                    classification.category === 'bottom' ? 'bottoms' : 
                    classification.category === 'accessory' ? 'accessories' : 
                    classification.category as GarmentCategory);
        setSubcategory(classification.subcategory || '');
        setColor(classification.primaryColor || '#a78bfa');
        setSecondaryColors(classification.secondaryColors?.join(', ') || '');
        setStyle(classification.style || 'casual');
        setSeason(classification.season || ['verano']);
        setMaterial(classification.material || '');
        setAiConfidence(classification.confidence);
        
        // Dynamic name generation
        setName(classification.subcategory
          ? `${classification.subcategory.charAt(0).toUpperCase() + classification.subcategory.slice(1)} ${classification.primaryColor || ''}`.trim()
          : `Prenda ${classification.primaryColor || ''}`.trim());
      } else {
        setUploadError(classificationResult.classificationError || 'La IA falló al clasificar la prenda, por favor llénala manualmente.');
      }
      setIsProcessed(true);
    } catch (err: any) {
      setUploadError(err.message || 'Error al subir la prenda al servidor.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!imageKey) return;
    try {
      const data = {
        imageKey,
        category: category === 'tops' ? 'top' : category === 'bottoms' ? 'bottom' : category === 'accessories' ? 'accessory' : category,
        subcategory: subcategory.trim() || undefined,
        primaryColor: color || undefined,
        secondaryColors: secondaryColors.split(',').map(s => s.trim()).filter(Boolean),
        style: style || undefined,
        season: season.length > 0 ? season : undefined,
        material: material.trim() || undefined,
        aiConfidence: aiConfidence || undefined
      };

      const success = await confirmGarment(data);
      if (success) {
        setIsAddModalOpen(false);
      } else {
        alert('Llegaste al límite del Plan Free. Actualiza a Style Pro para subir prendas ilimitadas.');
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar la prenda.');
    }
  };

  const handleOpenDetail = (garment: Garment) => {
    setSelectedGarment(garment);
    setEditCategory(garment.category);
    setEditSubcategory(garment.subcategory || '');
    setEditColor(garment.color);
    setEditStyle(garment.style || 'casual');
    setEditMaterial(garment.material || '');
    setEditSeason(garment.season || []);
    setIsEditing(false);
    setIsDetailModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedGarment) return;
    setIsSavingEdit(true);
    try {
      const mappedCategory = editCategory === 'tops' ? 'top' : editCategory === 'bottoms' ? 'bottom' : editCategory === 'accessories' ? 'accessory' : editCategory;
      await api.garments.update(selectedGarment.id, {
        category: mappedCategory,
        subcategory: editSubcategory.trim() || undefined,
        primaryColor: editColor || undefined,
        style: editStyle || undefined,
        material: editMaterial.trim() || undefined,
        season: editSeason.length > 0 ? editSeason : undefined
      });
      await fetchCloset();
      setIsEditing(false);
      setIsDetailModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar la prenda.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteGarment = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta prenda permanentemente?')) {
      await deleteGarment(id);
      setIsDetailModalOpen(false);
    }
  };

  const handleToggleSeason = (s: string) => {
    if (season.includes(s)) {
      setSeason(season.filter(item => item !== s));
    } else {
      setSeason([...season, s]);
    }
  };

  const handleToggleEditSeason = (s: string) => {
    if (editSeason.includes(s)) {
      setEditSeason(editSeason.filter(item => item !== s));
    } else {
      setEditSeason([...editSeason, s]);
    }
  };

  const getLimitColor = () => {
    const ratio = closet.length / 20;
    if (ratio >= 0.9) return 'var(--color-error)';
    if (ratio >= 0.7) return 'var(--color-accent-champagne)';
    return 'var(--color-action-primary-bg)';
  };

  return (
    <div className="flex-col gap-md">
      
      {/* Top Segmented Sub-tabs */}
      <div 
        className="flex-row gap-xs w-full" 
        style={{ 
          background: 'var(--color-bg-muted)', 
          padding: '4px', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--color-border)' 
        }}
      >
        <button
          className={`btn ${activeSubTab === 'garments' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '8px', fontSize: '0.75rem', border: 'none', borderRadius: 'var(--radius-sm)' }}
          onClick={() => setActiveSubTab('garments')}
        >
          Mi Closet ({closet.length})
        </button>
        <button
          className={`btn ${activeSubTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '8px', fontSize: '0.75rem', border: 'none', borderRadius: 'var(--radius-sm)' }}
          onClick={() => setActiveSubTab('history')}
        >
          Historial de Outfits
        </button>
      </div>

      {activeSubTab === 'history' ? (
        <OutfitHistory />
      ) : (
        <div className="flex-col gap-md animate-fade-in">
          {/* Title & Limits */}
          <div className="flex-row align-center justify-between">
            <div className="flex-col">
              <h2 className="title-medium text-gradient-primary">Tu Armario Digital</h2>
              <p className="text-xs text-muted">Colección de prendas recortadas por IA</p>
            </div>

            {user?.plan === 'free' ? (
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
              { id: 'accessories', label: 'Accesorios' }
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
          {user?.plan === 'free' && closet.length >= 18 && (
            <div className="glass-card flex-row align-center gap-sm" style={{ borderLeft: '4px solid var(--color-error)', padding: '12px', background: 'var(--color-error-bg)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
              <div className="flex-col">
                <span className="text-xs font-bold" style={{ color: 'var(--color-error)' }}>¡Casi al límite de tu clóset!</span>
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
                <div 
                  key={item.id} 
                  className="glass-card interactive flex-col align-center relative" 
                  style={{ padding: '12px', cursor: 'pointer' }}
                  onClick={() => handleOpenDetail(item)}
                >
                  <div style={{ width: '100%', height: '110px', position: 'relative' }}>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      />
                    ) : (
                      <GarmentIcon category={item.category} color={item.color} size={36} />
                    )}
                  </div>
                  <div className="mt-sm w-full text-center">
                    <span className="text-xs font-bold" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <span className="text-xs text-muted" style={{ textTransform: 'capitalize', fontSize: '0.65rem' }}>
                      {item.subcategory || item.category}
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
              boxShadow: 'var(--shadow-overlay)'
            }}
            onClick={handleOpenAddModal}
            disabled={user?.plan === 'free' && closet.length >= 20}
          >
            <Plus size={24} />
          </button>
        </div>
      )}

      {/* Upload/Digitize Modal */}
      {isAddModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--color-overlay)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div className="glass-card w-full" style={{ maxWidth: '450px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <button 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h3 className="title-medium text-gradient-primary flex-row align-center gap-xs mb-sm">
              <Sparkles size={18} />
              Digitalizar Prenda
            </h3>
            <p className="text-xs text-muted mb-md">El **Visual Agent** procesará tu foto para quitar el fondo y clasificarla automáticamente.</p>

            <div className="flex-col gap-sm">
              
              {/* File input area */}
              <div 
                className="flex-col align-center justify-center relative overflow-hidden" 
                style={{ 
                  height: '140px', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'var(--color-bg-muted)',
                  border: '1px dashed var(--color-border)'
                }}
              >
                {isUploading ? (
                  <div className="flex-col align-center gap-xs">
                    <RefreshCw className="animate-spin text-muted" size={24} style={{ color: 'var(--color-action-primary-bg)' }} />
                    <span className="text-xs text-muted">Subiendo y analizando foto...</span>
                    <div className="scanning-bar" />
                  </div>
                ) : isProcessed ? (
                  <div className="flex-col align-center gap-sm">
                    {selectedFile && (
                      <span className="text-xs text-muted font-bold truncate" style={{ maxWidth: '200px' }}>
                        {selectedFile.name}
                      </span>
                    )}
                    <span className="eco-badge">
                      <Check size={12} /> Procesamiento Listo
                    </span>
                  </div>
                ) : (
                  <label className="flex-col align-center gap-sm cursor-pointer" style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
                    <Upload size={24} className="text-muted" />
                    <span className="text-xs text-muted font-bold">Seleccionar Foto del Dispositivo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>

              {uploadError && (
                <div className="glass-card flex-row align-center gap-xs" style={{ borderLeft: '4px solid var(--color-error)', padding: '10px', background: 'var(--color-error-bg)' }}>
                  <Info size={14} style={{ color: 'var(--color-error)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-error)' }}>{uploadError}</span>
                </div>
              )}

              {/* Editable Fields once processed */}
              {isProcessed && (
                <div className="flex-col gap-sm animate-fade-in">
                  <div className="form-group">
                    <label className="form-label">Nombre de Prenda</label>
                    <input 
                      type="text" 
                      className="input-glass"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Categoría</label>
                      <select 
                        className="input-glass"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                        style={{ background: 'var(--color-bg-muted)' }}
                      >
                        <option value="tops">Top / Superior</option>
                        <option value="bottoms">Bottom / Inferior</option>
                        <option value="outerwear">Outerwear / Abrigo</option>
                        <option value="shoes">Shoes / Calzado</option>
                        <option value="accessories">Accessory / Accesorio</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subcategoría (Tipo)</label>
                      <input 
                        type="text" 
                        className="input-glass"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="Ej. camisa, jeans, casaca"
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Color Principal</label>
                      <div className="flex-row align-center gap-sm">
                        <input 
                          type="color" 
                          value={color.startsWith('#') ? color : '#a78bfa'}
                          onChange={(e) => setColor(e.target.value)}
                          style={{ border: 'none', background: 'none', width: '40px', height: '40px', cursor: 'pointer' }}
                        />
                        <span className="text-xs font-bold uppercase">{color}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Material</label>
                      <input 
                        type="text" 
                        className="input-glass"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Ej. algodón, cuero, lino"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temporadas</label>
                    <div className="flex-row gap-xs wrap">
                      {['verano', 'otoño', 'invierno', 'primavera'].map(s => {
                        const active = season.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            className={`btn ${active ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '4px 10px', fontSize: '0.7rem', width: 'auto' }}
                            onClick={() => handleToggleSeason(s)}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Estilo</label>
                      <input 
                        type="text" 
                        className="input-glass"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        placeholder="Ej. casual, formal, deportivo"
                      />
                    </div>

                    {aiConfidence !== null && (
                      <div className="flex-col justify-end" style={{ paddingBottom: '8px' }}>
                        <span className="text-xs text-muted flex-row align-center gap-xs">
                          <Award size={14} style={{ color: 'var(--color-success)' }} />
                          Confianza IA: {Math.round(aiConfidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  disabled={!isProcessed || isUploading}
                  onClick={handleSaveItem}
                >
                  Añadir al Clóset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Garment Detail & Edit Modal */}
      {isDetailModalOpen && selectedGarment && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--color-overlay)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
        >
          <div className="glass-card w-full" style={{ maxWidth: '450px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <button 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
              onClick={() => setIsDetailModalOpen(false)}
            >
              <X size={20} />
            </button>

            {isEditing ? (
              <div className="flex-col gap-sm">
                <h3 className="title-medium text-gradient-primary flex-row align-center gap-xs mb-sm">
                  <Edit2 size={18} />
                  Editar Prenda
                </h3>

                <div className="form-group">
                  <label className="form-label">Subcategoría / Nombre</label>
                  <input 
                    type="text" 
                    className="input-glass"
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <select 
                      className="input-glass"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as GarmentCategory)}
                      style={{ background: 'var(--color-bg-muted)' }}
                    >
                      <option value="tops">Top / Superior</option>
                      <option value="bottoms">Bottom / Inferior</option>
                      <option value="outerwear">Outerwear / Abrigo</option>
                      <option value="shoes">Shoes / Calzado</option>
                      <option value="accessories">Accessory / Accesorio</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <div className="flex-row align-center gap-sm">
                      <input 
                        type="color" 
                        value={editColor.startsWith('#') ? editColor : '#a78bfa'}
                        onChange={(e) => setEditColor(e.target.value)}
                        style={{ border: 'none', background: 'none', width: '40px', height: '40px', cursor: 'pointer' }}
                      />
                      <span className="text-xs font-bold uppercase">{editColor}</span>
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Material</label>
                    <input 
                      type="text" 
                      className="input-glass"
                      value={editMaterial}
                      onChange={(e) => setEditMaterial(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estilo</label>
                    <input 
                      type="text" 
                      className="input-glass"
                      value={editStyle}
                      onChange={(e) => setEditStyle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Temporadas</label>
                  <div className="flex-row gap-xs wrap">
                    {['verano', 'otoño', 'invierno', 'primavera'].map(s => {
                      const active = editSeason.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`btn ${active ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '4px 10px', fontSize: '0.7rem', width: 'auto' }}
                          onClick={() => handleToggleEditSeason(s)}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-row gap-sm mt-md">
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={isSavingEdit}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit}
                  >
                    {isSavingEdit ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-col gap-md text-left">
                
                {/* Photo frame */}
                <div 
                  className="flex-row align-center justify-center relative overflow-hidden"
                  style={{ 
                    height: '200px', 
                    borderRadius: 'var(--radius-lg)', 
                    background: 'var(--color-bg-muted)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {selectedGarment.imageUrl ? (
                    <img 
                      src={selectedGarment.imageUrl} 
                      alt={selectedGarment.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <GarmentIcon category={selectedGarment.category} color={selectedGarment.color} size={48} />
                  )}
                </div>

                {/* Info block */}
                <div className="flex-col gap-xs">
                  <h3 className="title-medium text-gradient-primary">{selectedGarment.name}</h3>
                  <span className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>
                    Categoría: {selectedGarment.category} {selectedGarment.subcategory ? `• ${selectedGarment.subcategory}` : ''}
                  </span>
                </div>

                <div className="glass-card flex-col gap-sm" style={{ padding: '12px' }}>
                  <div className="flex-row justify-between align-center text-xs">
                    <span className="text-muted">Material:</span>
                    <span className="font-bold">{selectedGarment.material || 'No especificado'}</span>
                  </div>
                  <div className="flex-row justify-between align-center text-xs">
                    <span className="text-muted">Estilo:</span>
                    <span className="font-bold">{selectedGarment.style || 'No especificado'}</span>
                  </div>
                  <div className="flex-row justify-between align-center text-xs">
                    <span className="text-muted">Temporada:</span>
                    <span className="font-bold" style={{ textTransform: 'capitalize' }}>
                      {selectedGarment.season?.join(', ') || 'No especificada'}
                    </span>
                  </div>
                  <div className="flex-row justify-between align-center text-xs">
                    <span className="text-muted">Color Principal:</span>
                    <div className="flex-row align-center gap-xs">
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: selectedGarment.color, border: '1px solid var(--color-border)' }} />
                      <span className="font-bold uppercase" style={{ fontSize: '0.65rem' }}>{selectedGarment.color}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card flex-col gap-sm" style={{ padding: '12px' }}>
                  <div className="flex-row justify-between align-center text-xs">
                    <span className="text-muted flex-row align-center gap-xs">
                      <Calendar size={14} />
                      Veces Vestida:
                    </span>
                    <span className="font-bold text-gradient-primary">{selectedGarment.timesWorn || 0} veces</span>
                  </div>
                  {selectedGarment.lastWornAt && (
                    <div className="flex-row justify-between align-center text-xs">
                      <span className="text-muted">Última Vez Usada:</span>
                      <span className="font-bold">
                        {new Date(selectedGarment.lastWornAt).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Operations */}
                <div className="flex-row gap-xs mt-sm w-full">
                  <button 
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 size={14} />
                    Editar Detalles
                  </button>
                  <button 
                    className="btn btn-outline"
                    style={{ 
                      width: '44px', 
                      borderColor: 'var(--color-error)', 
                      color: 'var(--color-error)', 
                      background: 'var(--color-error-bg)',
                      padding: 0 
                    }}
                    onClick={() => handleDeleteGarment(selectedGarment.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
