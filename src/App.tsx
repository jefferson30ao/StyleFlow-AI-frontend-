import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Closet } from './pages/Closet';
import { MixMatch } from './pages/MixMatch';
import { MirrorMode } from './pages/MirrorMode';
import { Store } from './pages/Store';
import { Plans } from './pages/Plans';
import { Auth } from './pages/Auth';
import logoImg from './assets/logo.png';

import { 
  Sparkles, 
  Home, 
  Layers, 
  Crown, 
  Leaf, 
  CreditCard,
  Sun,
  Moon,
  X
} from 'lucide-react';

import adBannerGif1 from './assets/publicidad_barra_inferior.gif';
import adBannerGif2 from './assets/publicidad_barra_inferior_2.gif';
import adBannerGif3 from './assets/publicidad_barra_inferior_3.gif';
import adBannerGif4 from './assets/publicidad_barra_inferior_4.gif';
import adBannerGif5 from './assets/publicidad_barra_inferior_5.gif';
import adFullScreenGif from './assets/publicidad_pantalla_completa.gif';

const BANNERS = [
  adBannerGif1,
  adBannerGif2,
  adBannerGif3,
  adBannerGif4,
  adBannerGif5
];

/* ─── Theme hook with localStorage persistence ─── */
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('sf_theme');
    if (stored === 'dark' || stored === 'light') return stored;
    // Respect OS preference as fallback
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sf_theme', theme);
  }, [theme]);

  const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggle };
}

const AppContent: React.FC = () => {
  const { isOnboarded, activeTab, setActiveTab, isAuthenticated, isAuthenticating } = useApp();
  const { theme, toggle: toggleTheme } = useTheme();
  const [showFullScreenAd, setShowFullScreenAd] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    // Show interstitial ad after 3 minutes initially
    const initialTimer = setTimeout(() => {
      setShowFullScreenAd(true);
    }, 180000);

    // Repeat ad appearance every 10 minutes
    const intervalTimer = setInterval(() => {
      setShowFullScreenAd(true);
    }, 600000);

    // Rotate banner ad every 15 seconds
    const bannerTimer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % BANNERS.length);
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      clearInterval(bannerTimer);
    };
  }, []);

  if (isAuthenticating) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px' }}>
        <div className="logo-glow" style={{ width: '44px', height: '44px', borderRadius: '8px' }}>
          <img src={logoImg} alt="StyleFlow AI" />
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Cargando StyleFlow AI…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  if (!isOnboarded) {

    return (
      <div className="app-container">
        <header className="app-header">
          <div className="app-title-container">
            <div className="logo-glow">
              <img src={logoImg} alt="StyleFlow AI" />
            </div>
            <div className="flex-col">
              <h1 className="app-title">StyleFlow AI</h1>
              <span className="app-subtitle">Smart Wardrobe</span>
            </div>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </header>
        <main className="app-main">
          <Onboarding />
        </main>
      </div>
    );
  }

  // Render tabs
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'closet':
        return <Closet />;
      case 'mixmatch':
        return <MixMatch />;
      case 'mirror':
        return <MirrorMode />;
      case 'store':
        return <Store />;
      case 'plans':
        return <Plans />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sticky Header */}
      <header className="app-header">
        <div className="app-title-container" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="logo-glow">
            <img src={logoImg} alt="StyleFlow AI" />
          </div>
          <div className="flex-col">
            <h1 className="app-title">StyleFlow AI</h1>
            <span className="app-subtitle">Smart Wardrobe</span>
          </div>
        </div>
        
        {/* Header right: AI status + Theme toggle */}
        <div className="flex-row align-center gap-sm">
          <div className="flex-row align-center gap-xs">
            <div className="ai-status-dot" />
            <span style={{ fontSize: '0.6rem', fontWeight: 500, color: 'var(--color-text-tertiary)', letterSpacing: '0.02em' }}>IA Activa</span>
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="app-main">
        {renderActivePage()}
      </main>

      {/* Simulated bottom ad banner */}
      <div className="bottom-ad-banner">
        <img src={BANNERS[currentBannerIndex]} alt={`Simulated Advertisement ${currentBannerIndex + 1}`} />
      </div>

      {/* Responsive Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Home />
          <span>Inicio</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'closet' ? 'active' : ''}`}
          onClick={() => setActiveTab('closet')}
        >
          <Layers />
          <span>Closet</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'mixmatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('mixmatch')}
        >
          <Sparkles />
          <span>Mix</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'mirror' ? 'active' : ''}`}
          onClick={() => setActiveTab('mirror')}
        >
          <Crown />
          <span>Probador</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'store' ? 'active' : ''}`}
          onClick={() => setActiveTab('store')}
        >
          <Leaf />
          <span>Aliados</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <CreditCard />
          <span>Planes</span>
        </button>
      </nav>

      {/* Full screen interstitial ad */}
      {showFullScreenAd && (
        <div className="full-screen-ad-overlay">
          <div className="full-screen-ad-container">
            <button 
              className="close-ad-button" 
              onClick={() => setShowFullScreenAd(false)}
              aria-label="Cerrar publicidad"
            >
              <X size={20} />
            </button>
            <img src={adFullScreenGif} alt="Publicidad en pantalla completa" className="full-screen-ad-image" />
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
