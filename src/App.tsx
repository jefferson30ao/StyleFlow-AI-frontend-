import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Closet } from './pages/Closet';
import { MixMatch } from './pages/MixMatch';
import { MirrorMode } from './pages/MirrorMode';
import { Store } from './pages/Store';
import { Plans } from './pages/Plans';

import { 
  Sparkles, 
  Home, 
  Layers, 
  Crown, 
  Leaf, 
  CreditCard 
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { isOnboarded, activeTab, setActiveTab } = useApp();

  if (!isOnboarded) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="app-title-container">
            <div className="logo-glow">
              <Sparkles size={16} style={{ color: '#fff' }} />
            </div>
            <div className="flex-col">
              <h1 className="app-title">StyleFlow AI</h1>
              <span className="app-subtitle">Smart Wardrobe</span>
            </div>
          </div>
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
            <Sparkles size={16} style={{ color: '#fff' }} />
          </div>
          <div className="flex-col">
            <h1 className="app-title">StyleFlow AI</h1>
            <span className="app-subtitle">Smart Wardrobe</span>
          </div>
        </div>
        
        {/* Simple top indicators */}
        <div className="flex-row align-center gap-xs">
          <div 
            className="pulse-glow-effect"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981'
            }}
          />
          <span className="text-xs text-muted" style={{ fontSize: '0.62rem', fontWeight: 600 }}>IA Conectada</span>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="app-main">
        {renderActivePage()}
      </main>

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
