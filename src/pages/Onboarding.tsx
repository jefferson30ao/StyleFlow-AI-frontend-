import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { GarmentCategory } from '../types';
import { ArrowRight, Check, AlertCircle, Upload, Award } from 'lucide-react';
import logoImg from '../assets/logo.png';

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=240&h=360&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=240&h=360&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=240&h=360&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=240&h=360&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=240&h=360&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=240&h=360&q=80',
  'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=240&h=360&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=240&h=360&q=80'
];

export const Onboarding: React.FC = () => {
  const { 
    completeOnboarding, 
    user, 
    uploadGarmentFile, 
    confirmGarment, 
    updateUserName 
  } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [digitizedCount, setDigitizedCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // User name input
  const [userName, setUserName] = useState<string>(user?.name || 'Valeria');

  // Digitization states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // AI processed states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isProcessed, setIsProcessed] = useState<boolean>(false);

  // Form states for manual review/confirmation
  const [imageKey, setImageKey] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<GarmentCategory>('tops');
  const [subcategory, setSubcategory] = useState<string>('');
  const [color, setColor] = useState<string>('#a78bfa');
  const [secondaryColors, setSecondaryColors] = useState<string>('');
  const [style, setStyle] = useState<string>('casual');
  const [season, setSeason] = useState<string[]>(['verano']);
  const [material, setMaterial] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setImageKey('');
    setName('');
    setCategory('tops');
    setSubcategory('');
    setColor('#a78bfa');
    setSecondaryColors('');
    setStyle('casual');
    setSeason(['verano']);
    setMaterial('');
    setAiConfidence(null);
    setIsProcessed(false);
    setIsProcessing(false);
    setErrorMsg('');
  };

  const handleStartDigitizing = () => {
    if (!userName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre');
      return;
    }
    setErrorMsg('');
    updateUserName(userName.trim());
    setStep(2);
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('onboarding-file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      resetState();
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      handleUploadAndClassify(file);
    }
  };

  const handleUploadAndClassify = async (file: File) => {
    setIsProcessing(true);
    setIsProcessed(false);
    setErrorMsg('');
    try {
      const result = await uploadGarmentFile(file);
      setImageKey(result.imageKey);
      
      const classification = result.classification;
      if (classification) {
        setCategory(
          classification.category === 'top' ? 'tops' : 
          classification.category === 'bottom' ? 'bottoms' : 
          classification.category === 'accessory' ? 'accessories' : 
          classification.category as GarmentCategory
        );
        setSubcategory(classification.subcategory || '');
        setColor(classification.primaryColor || '#a78bfa');
        setSecondaryColors(classification.secondaryColors?.join(', ') || '');
        setStyle(classification.style || 'casual');
        setSeason(classification.season || ['verano']);
        setMaterial(classification.material || '');
        setAiConfidence(classification.confidence);
        
        setName(classification.subcategory
          ? `${classification.subcategory.charAt(0).toUpperCase() + classification.subcategory.slice(1)} ${classification.primaryColor || ''}`.trim()
          : `Prenda ${classification.primaryColor || ''}`.trim()
        );
      } else {
        setErrorMsg(result.classificationError || 'La IA falló al clasificar la prenda. Complétala manualmente.');
      }
      setIsProcessed(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la foto con el servidor.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveFileToCloset = async () => {
    if (!imageKey) return;
    setIsProcessing(true);
    setErrorMsg('');
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
        setDigitizedCount(prev => prev + 1);
        resetState();
      } else {
        setErrorMsg('Llegaste al límite de la versión Free.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la prenda.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSeason = (s: string) => {
    if (season.includes(s)) {
      setSeason(season.filter(item => item !== s));
    } else {
      setSeason([...season, s]);
    }
  };

  return (
    <div className="flex-col w-full h-full justify-between" style={{ minHeight: '80vh' }}>
      {step === 1 ? (
        <div className="flex-col gap-lg mt-lg text-center align-center">
          <div className="logo-glow" style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)' }}>
            <img src={logoImg} alt="StyleFlow AI" />
          </div>
          
          <div className="flex-col gap-sm">
            <h1 className="title-large">Bienvenido a <span className="text-gradient-primary">StyleFlow AI</span></h1>
            <p className="text-sm text-muted" style={{ padding: '0 16px' }}>
              Tu planificador de outfits proactivo y autónomo que elimina la parálisis de decisión diaria.
            </p>
          </div>

          <div className="glass-card w-full mt-md text-left flex-col gap-md">
            <h3 className="title-medium text-gradient-primary">Comencemos tu Estilo</h3>
            <p className="text-xs text-muted">
              Para personalizar tus recomendaciones según el clima de Lima Metropolitana y tu agenda, primero dinos tu nombre.
            </p>
            
            <div className="form-group">
              <label className="form-label">Nombre de Usuario</label>
              <input 
                type="text" 
                className="input-glass" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej. Valeria" 
              />
              {errorMsg && (
                <div className="flex-row align-center gap-xs mt-sm" style={{ color: 'var(--color-error)' }}>
                  <AlertCircle size={14} />
                  <span className="text-xs">{errorMsg}</span>
                </div>
              )}
            </div>

            <button className="btn btn-primary" onClick={handleStartDigitizing}>
              Empezar Onboarding
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Carrusel de tendencias de moda */}
          <div className="carousel-section w-full flex-col align-center mt-md">
            <span className="text-xs uppercase font-medium tracking-wider text-muted mb-xs" style={{ opacity: 0.8, fontSize: '0.62rem', letterSpacing: '0.08em' }}>
              Descubre Tendencias e Inspiración
            </span>
            <div className="marquee-container w-full">
              <div className="marquee-track">
                {CAROUSEL_IMAGES.concat(CAROUSEL_IMAGES).map((url, idx) => (
                  <img 
                    key={idx} 
                    src={url} 
                    alt={`Tendencia ${idx + 1}`} 
                    className="marquee-image" 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-col gap-md animate-fade-in">
          <div className="flex-col gap-xs">
            <span className="text-xs font-bold text-gradient-primary" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
              Fase de Onboarding • Asistente Visual
            </span>
            <h2 className="title-medium">Digitaliza tu Clóset</h2>
            <p className="text-xs text-muted">
              El **Visual Agent** de StyleFlow automatiza la eliminación de fondos y clasifica tus prendas con IA en segundos.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex-row align-center justify-between glass-card" style={{ padding: '12px 16px' }}>
            <span className="text-xs font-medium">Prendas digitalizadas:</span>
            <div className="flex-row align-center gap-sm">
              <span className="text-sm font-bold text-gradient-primary">{digitizedCount} / 2</span>
              <div 
                style={{ 
                  width: '80px', 
                  height: '6px', 
                  backgroundColor: 'var(--color-border)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{ 
                    width: `${Math.min((digitizedCount / 2) * 100, 100)}%`, 
                    height: '100%', 
                    background: 'var(--progress-gradient)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sandbox workspace */}
          <div className="glass-card flex-col align-center justify-center relative overflow-hidden" style={{ minHeight: '260px', padding: '16px' }}>
            
            {isProcessing ? (
              <div className="w-full flex-col align-center gap-md py-lg">
                <div 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--color-bg-muted)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Subiendo..." 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.5 }} 
                    />
                  )}
                  <div className="scanning-bar" />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-bold animate-pulse text-gradient-primary">
                    Subiendo y analizando foto con IA...
                  </h4>
                  <p className="text-xs text-muted">Por favor, espera un momento.</p>
                </div>
              </div>
            ) : selectedFile && isProcessed ? (
              /* Real Uploaded Garment Form and Review */
              <div className="w-full flex-col gap-md animate-fade-in" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                <div className="flex-row gap-md align-center">
                  <div 
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: 'var(--radius-md)',
                      background: 'repeating-conic-gradient(var(--color-hover-lift) 0% 25%, transparent 0% 50%) 50% / 16px 16px',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    <img 
                      src={previewUrl} 
                      alt="Recorte de Prenda" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                  <div className="flex-col">
                    <span className="eco-badge mb-xs flex-row align-center gap-xs" style={{ width: 'fit-content', padding: '2px 6px', fontSize: '0.65rem' }}>
                      <Check size={10} /> Fondo Removido
                    </span>
                    <h4 className="text-sm font-bold truncate" style={{ maxWidth: '200px' }}>{name || 'Nueva Prenda'}</h4>
                    {aiConfidence !== null && (
                      <span className="text-xxs text-muted flex-row align-center gap-xs mt-xs">
                        <Award size={12} style={{ color: 'var(--color-success)' }} />
                        Confianza IA: {Math.round(aiConfidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-col gap-sm" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
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
                        <option value="outerwear">Abrigo</option>
                        <option value="shoes">Calzado</option>
                        <option value="accessories">Accesorio</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subcategoría</label>
                      <input 
                        type="text" 
                        className="input-glass"
                        value={subcategory}
                        onChange={(e) => setSubcategory(e.target.value)}
                        placeholder="Ej. polo, falda, zapatillas"
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
                          style={{ border: 'none', background: 'none', width: '36px', height: '36px', cursor: 'pointer' }}
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
                        placeholder="Ej. algodón, lino"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temporada</label>
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

                  <div className="form-group">
                    <label className="form-label">Estilo</label>
                    <input 
                      type="text" 
                      className="input-glass"
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      placeholder="Ej. casual, formal"
                    />
                  </div>

                  <div className="flex-row gap-sm mt-sm">
                    <button className="btn btn-outline" onClick={resetState} style={{ flex: 1 }}>
                      Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveFileToCloset} style={{ flex: 1.5 }}>
                      <Check size={16} /> Guardar Prenda
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Initial choice state (Upload Only) */
              <div className="text-center flex-col align-center gap-md w-full" style={{ padding: '12px' }}>
                <div 
                  onClick={triggerFileInput}
                  className="glass-card interactive flex-col align-center justify-center cursor-pointer hover-lift-effect"
                  style={{
                    width: '100%',
                    height: '110px',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-muted)',
                    gap: '8px',
                    display: 'flex'
                  }}
                >
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--color-action-primary-bg)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Upload size={18} />
                  </div>
                  <div className="flex-col">
                    <span className="text-xs font-bold text-gradient-primary">Subir foto desde tu galería</span>
                    <span className="text-xxs text-muted">Acepta archivos JPG, PNG y WEBP</span>
                  </div>
                </div>

                <input 
                  id="onboarding-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="glass-card flex-row align-center gap-sm animate-fade-in" style={{ borderLeft: '4px solid var(--color-error)', padding: '12px', background: 'var(--color-error-bg)' }}>
              <AlertCircle size={16} style={{ color: 'var(--color-error)' }} />
              <span className="text-xs" style={{ color: 'var(--color-error)' }}>{errorMsg}</span>
            </div>
          )}

          {/* Continue bar */}
          <div className="flex-col gap-sm mt-md">
            <button 
              className="btn btn-primary" 
              disabled={digitizedCount < 2} 
              onClick={completeOnboarding}
            >
              Comenzar Experiencia
              <ArrowRight size={18} />
            </button>
            <span className="text-xs text-muted text-center">
              {digitizedCount === 0 
                ? 'Debes digitalizar al menos 2 prendas para iniciar.' 
                : digitizedCount === 1 
                  ? 'Debes digitalizar al menos 1 prenda más para iniciar.'
                  : `¡Estás listo! Has cargado ${digitizedCount} prendas en tu clóset.`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
