import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, AlertCircle, RefreshCw, LogIn, UserPlus } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Auth: React.FC = () => {
  const { login, register, authError, setAuthError } = useApp();
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Por favor ingresa todos los campos.');
      return;
    }
    if (password.length < 8) {
      setAuthError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    setAuthError('');
    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      // Errors are already handled and set in AppContext's authError
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTab = () => {
    setIsLoginTab(!isLoginTab);
    setAuthError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex-col w-full align-center justify-center" style={{ minHeight: '80vh', padding: '20px' }}>
      <div className="logo-glow mb-lg" style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)' }}>
        <img src={logoImg} alt="StyleFlow AI" />
      </div>

      <div className="text-center mb-lg">
        <h1 className="title-large">StyleFlow AI</h1>
        <span className="app-subtitle">Smart Assistant &amp; Wardrobe</span>
      </div>

      {/* Tabs */}
      <div className="flex-row gap-xs w-full mb-md" style={{ maxWidth: '400px', background: 'var(--color-bg-muted)', padding: '4px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
        <button
          className={`btn ${isLoginTab ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', border: 'none' }}
          onClick={() => !isLoginTab && toggleTab()}
        >
          <LogIn size={14} />
          Iniciar Sesión
        </button>
        <button
          className={`btn ${!isLoginTab ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '10px', fontSize: '0.8rem', borderRadius: 'var(--radius-full)', border: 'none' }}
          onClick={() => isLoginTab && toggleTab()}
        >
          <UserPlus size={14} />
          Registrarse
        </button>
      </div>

      {/* Auth Card */}
      <form 
        onSubmit={handleSubmit}
        className="glass-card w-full flex-col gap-md text-left" 
        style={{ maxWidth: '400px', padding: '24px' }}
      >
        <h3 className="title-medium text-gradient-primary">
          {isLoginTab ? 'Ingresa a tu armario' : 'Crea tu cuenta de estilo'}
        </h3>
        <p className="text-xs text-muted">
          {isLoginTab 
            ? 'Bienvenido de vuelta. Conéctate para planificar tus combinaciones de hoy.' 
            : 'Comienza gratis. La IA creará tu perfil de estilo y armario digital instantáneamente.'}
        </p>

        {/* Error Notification */}
        {authError && (
          <div className="glass-card flex-row align-center gap-sm" style={{ borderLeft: '4px solid var(--color-error)', padding: '12px', background: 'var(--color-error-bg)' }}>
            <AlertCircle size={16} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: 'var(--color-error)' }}>{authError}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Correo Electrónico</label>
          <div className="flex-row align-center gap-xs relative">
            <Mail size={16} className="text-muted" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
            <input 
              type="email" 
              className="input-glass" 
              placeholder="juan@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '36px' }}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <div className="flex-row align-center gap-xs relative">
            <Lock size={16} className="text-muted" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
            <input 
              type="password" 
              className="input-glass" 
              placeholder="Min. 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '36px' }}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary mt-sm" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Procesando...
            </>
          ) : isLoginTab ? (
            <>
              Ingresar
              <LogIn size={16} />
            </>
          ) : (
            <>
              Crear Cuenta
              <UserPlus size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
