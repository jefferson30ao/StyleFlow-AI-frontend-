import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { PlanType } from '../types';
import { Check, Crown, CreditCard, ShieldCheck, X } from 'lucide-react';

export const Plans: React.FC = () => {
  const { user, setPlan } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [cardName, setCardName] = useState('Valeria Torres');
  const [cardNumber, setCardNumber] = useState('4557 •••• •••• 8812');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const plansData = [
    {
      id: 'free' as PlanType,
      name: 'Plan Free',
      price: '$0.00',
      period: 'siempre',
      features: [
        'Registro limitado (hasta 20 prendas)',
        'Acceso a motor de recomendaciones básicas',
        'Soporte comunitario básico',
        'Presencia de anuncios no intrusivos'
      ],
      crownColor: 'hsl(var(--text-muted))'
    },
    {
      id: 'pro' as PlanType,
      name: 'Style Pro',
      price: '$9.99',
      period: 'mes',
      features: [
        'Armario digital ILIMITADO',
        'Recomendaciones cruzadas clima + agenda',
        'Eliminación completa de publicidad',
        'Soporte prioritario 24/7'
      ],
      crownColor: 'hsl(var(--primary))'
    },
    {
      id: 'elite' as PlanType,
      name: 'Plan Elite',
      price: '$19.99',
      period: 'mes',
      features: [
        'Todas las funciones del Plan Pro',
        'Probador virtual Mirror Mode (Nano Banana 2)',
        'Personal Shopper IA integrado',
        'Análisis predictivo de estilo y tendencias'
      ],
      crownColor: '#f59e0b'
    }
  ];

  const handleOpenCheckout = (plan: PlanType) => {
    setSelectedPlan(plan);
    setPaymentSuccess(false);
    setIsPaying(false);
    setCheckoutModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan) return;
    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      
      // Update the plan state globally
      setTimeout(() => {
        setPlan(selectedPlan);
        setCheckoutModalOpen(false);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex-col gap-md">
      <div className="flex-col">
        <h2 className="title-medium text-gradient-primary">Planes de Suscripción</h2>
        <p className="text-xs text-muted">Elige el nivel de personalización ideal para ti</p>
      </div>

      {/* Plan Card Stack */}
      <div className="flex-col gap-md">
        {plansData.map(plan => {
          const isCurrent = user.plan === plan.id;
          
          return (
            <div 
              key={plan.id} 
              className="glass-card flex-col gap-md relative"
              style={{ 
                border: isCurrent 
                  ? `2px solid ${plan.id === 'elite' ? '#f59e0b' : 'hsl(var(--primary))'}`
                  : '1px solid hsla(var(--border-color), 0.6)'
              }}
            >
              {isCurrent && (
                <div 
                  className="eco-badge"
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '16px',
                    background: plan.id === 'elite' ? 'rgba(245, 158, 11, 0.15)' : 'hsla(var(--primary), 0.15)',
                    color: plan.id === 'elite' ? '#f59e0b' : 'hsl(var(--primary))',
                    borderColor: plan.id === 'elite' ? 'rgba(245,158,11,0.3)' : 'hsla(var(--primary), 0.3)'
                  }}
                >
                  Plan Activo
                </div>
              )}

              {/* Header card */}
              <div className="flex-row justify-between align-center">
                <div className="flex-col">
                  <h3 className="text-sm font-bold flex-row align-center gap-xs">
                    <Crown size={16} style={{ color: plan.crownColor }} />
                    {plan.name}
                  </h3>
                  <span className="text-xs text-muted" style={{ fontSize: '0.65rem' }}>Para jóvenes de Lima</span>
                </div>
                
                <div className="text-right">
                  <span className="text-lg font-bold text-gradient-primary">{plan.price}</span>
                  <span className="text-xs text-muted font-medium">/{plan.period}</span>
                </div>
              </div>

              {/* Feature lists */}
              <div className="flex-col gap-xs" style={{ borderTop: '1px solid hsla(var(--border-color), 0.5)', paddingTop: '12px' }}>
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex-row gap-xs align-center">
                    <Check size={12} style={{ color: plan.id === 'free' ? 'hsl(var(--text-muted))' : 'hsl(var(--secondary))', flexShrink: 0 }} />
                    <span className="text-xs text-muted" style={{ fontSize: '0.75rem' }}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Select Actions */}
              {!isCurrent ? (
                <button 
                  className="btn btn-primary mt-xs"
                  onClick={() => handleOpenCheckout(plan.id)}
                  style={{
                    background: plan.id === 'elite' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '',
                    boxShadow: plan.id === 'elite' ? '0 4px 15px rgba(245, 158, 11, 0.3)' : ''
                  }}
                >
                  Seleccionar {plan.name}
                </button>
              ) : (
                <button className="btn btn-outline mt-xs" disabled>
                  Estás en este Plan
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="glass-card w-full" style={{ maxWidth: '400px', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}
              onClick={() => setCheckoutModalOpen(false)}
            >
              <X size={20} />
            </button>

            {paymentSuccess ? (
              <div className="text-center flex-col align-center gap-md py-md">
                <div className="logo-glow" style={{ background: 'hsl(var(--secondary))', width: '56px', height: '56px', borderRadius: '50%' }}>
                  <ShieldCheck size={28} style={{ color: '#fff' }} />
                </div>
                <div>
                  <h3 className="title-medium text-gradient-secondary">¡Pago Exitoso!</h3>
                  <p className="text-xs text-muted mt-xs">Tu plan se ha actualizado a <strong style={{ color: '#fff' }}>{selectedPlan.toUpperCase()}</strong>.</p>
                </div>
                <span className="text-xs text-muted">Inicializando tus nuevas ventajas exclusivas...</span>
              </div>
            ) : (
              <div className="flex-col gap-md">
                <h3 className="title-medium text-gradient-primary flex-row align-center gap-xs">
                  <CreditCard size={18} />
                  Pasarela de Pago StyleFlow
                </h3>
                <p className="text-xs text-muted">Estás suscribiéndote al plan <strong>{selectedPlan.toUpperCase()}</strong>.</p>

                {/* Mock Credit Card Graphics */}
                <div 
                  className="glass-card flex-col justify-between" 
                  style={{ 
                    height: '160px', 
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                    color: '#fff',
                    border: 'none'
                  }}
                >
                  <div className="flex-row justify-between align-center">
                    <span className="text-xs font-bold uppercase tracking-widest">StyleFlow Gold Card</span>
                    <Crown size={20} style={{ color: selectedPlan === 'elite' ? '#f59e0b' : '#fff' }} />
                  </div>

                  <span className="text-md font-bold tracking-widest" style={{ letterSpacing: '2px', fontFamily: 'monospace' }}>
                    {cardNumber}
                  </span>

                  <div className="flex-row justify-between align-center">
                    <div className="flex-col">
                      <span className="text-muted" style={{ fontSize: '0.5rem', color: '#ddd' }}>TITULAR</span>
                      <span className="text-xs font-bold uppercase">{cardName}</span>
                    </div>
                    <div className="flex-col align-end">
                      <span className="text-muted" style={{ fontSize: '0.5rem', color: '#ddd' }}>VENCE</span>
                      <span className="text-xs font-bold">12 / 30</span>
                    </div>
                  </div>
                </div>

                {/* Inputs */}
                <div className="flex-col gap-sm">
                  <div className="form-group">
                    <label className="form-label">Nombre del Tarjetahabiente</label>
                    <input 
                      type="text" 
                      className="input-glass"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Número de Tarjeta</label>
                    <input 
                      type="text" 
                      className="input-glass"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-row justify-between align-center" style={{ borderTop: '1px solid hsla(var(--border-color), 0.5)', paddingTop: '12px' }}>
                  <span className="text-xs text-muted">Monto a pagar:</span>
                  <span className="text-sm font-bold text-gradient-primary">
                    {plansData.find(p => p.id === selectedPlan)?.price}
                  </span>
                </div>

                <button 
                  className="btn btn-primary"
                  disabled={isPaying}
                  onClick={handleConfirmPayment}
                >
                  {isPaying ? 'Procesando cargo...' : 'Confirmar Suscripción'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
