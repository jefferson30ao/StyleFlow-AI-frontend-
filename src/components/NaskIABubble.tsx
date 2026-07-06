import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Mic, Keyboard, X, Send, Volume2, Sparkles } from 'lucide-react';
import naskiaGif from '../assets/Realiza_la_animación_de_la_ima.gif';
import './NaskIABubble.css';

export const NaskIABubble: React.FC = () => {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Speech bubble overlays for the giant avatar
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [bubbleSender, setBubbleSender] = useState<'user' | 'naskia' | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [micFeedback, setMicFeedback] = useState('');

  // Auto-clear speech bubble after 6 seconds of naskia response to keep layout clean
  useEffect(() => {
    if (bubbleSender === 'naskia' && bubbleText) {
      const timer = setTimeout(() => {
        setBubbleText(null);
        setBubbleSender(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [bubbleText, bubbleSender]);

  // Clean states when modal closes
  const handleClose = () => {
    setIsOpen(false);
    setIsMicActive(false);
    setIsKeyboardActive(false);
    setMicFeedback('');
    setBubbleText(null);
    setBubbleSender(null);
    setIsTyping(false);
  };

  // Switch to keyboard input
  const handleKeyboardClick = () => {
    setIsKeyboardActive(true);
    setIsMicActive(false);
    setMicFeedback('');
  };

  // Switch to mic input
  const handleMicClick = () => {
    setIsMicActive(true);
    setIsKeyboardActive(false);
    setMicFeedback('Escuchando tu voz... (Simulación)');
    setBubbleText(null);
    setBubbleSender(null);
    setIsTyping(false);
    
    // Simulate hearing voice after 3 seconds
    setTimeout(() => {
      setMicFeedback('Procesando audio...');
      setTimeout(() => {
        setMicFeedback('');
        setIsMicActive(false);
        
        // Show user spoken text as a bubble above the avatar
        setBubbleText('🎙️ Recomiéndame algo para un día nublado en Lima.');
        setBubbleSender('user');
        
        // Trigger NaskIA typing response after 2 seconds
        setTimeout(() => {
          setBubbleText(null);
          setBubbleSender(null);
          setIsTyping(true);
          
          setTimeout(() => {
            setIsTyping(false);
            setBubbleText('¡Entendido! Con neblina limeña te sugiero tu casaca cortaviento impermeable y unas zapatillas eco.');
            setBubbleSender('naskia');
          }, 1500);
        }, 2000);

      }, 1000);
    }, 3000);
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');
    
    // Show user text as a bubble above the avatar
    setBubbleText(userText);
    setBubbleSender('user');
    setIsTyping(false);

    // Simulate NaskIA typing reply
    setTimeout(() => {
      setBubbleText(null);
      setBubbleSender(null);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        
        let replyText = 'Pronto podré conectarme con tu clóset digital para responder de manera personalizada. (Simulación)';
        const lowerInput = userText.toLowerCase();
        
        if (lowerInput.includes('hola') || lowerInput.includes('buenos')) {
          replyText = '¡Hola! Qué gusto saludarte. ¿Listo para planificar tu outfit de hoy en Lima? Pronto estaré completamente activa.';
        } else if (lowerInput.includes('outfit') || lowerInput.includes('ropa') || lowerInput.includes('vestir')) {
          replyText = 'Analizaré tus prendas guardadas y el clima actual para recomendarte la combinación perfecta.';
        } else if (lowerInput.includes('elite') || lowerInput.includes('plan')) {
          replyText = 'Como miembro Elite de StyleFlow, tendrás acceso exclusivo a mí para diseñar tus outfits.';
        }

        setBubbleText(replyText);
        setBubbleSender('naskia');
      }, 1500);
    }, 2000);
  };

  // Bubble and Dialog only render on plan elite
  if (user?.plan !== 'elite') return null;

  return (
    <>
      {/* FLOATING BUBBLE IN THE CORNER */}
      <div className="naskia-bubble-container" onClick={() => setIsOpen(true)}>
        <div className="naskia-bubble-main">
          <div className="naskia-bubble-avatar-wrapper">
            <img 
              src={naskiaGif} 
              alt="NaskIA Avatar Animado" 
              className="naskia-bubble-avatar-img"
            />
          </div>
          <div className="naskia-bubble-text-col">
            <div className="naskia-bubble-header">Nask<b>IA</b></div>
            <span className="naskia-bubble-coming-soon">Próximamente</span>
            <div className="naskia-bubble-footer">Shopper <b>IA</b></div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL DIALOGUE */}
      {isOpen && (
        <div className="naskia-modal-overlay" onClick={handleClose}>
          <div className="naskia-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="naskia-modal-header">
              <div className="naskia-modal-header-left">
                <div>
                  <div className="naskia-modal-title flex-row align-center gap-xs">
                    Nask<b>IA</b> <Sparkles size={13} className="naskia-sparkle-icon" />
                  </div>
                  <span className="naskia-modal-subtitle">Asistente Elite Personal</span>
                </div>
              </div>
              
              <button 
                className="naskia-modal-close-btn"
                onClick={handleClose}
                aria-label="Cerrar chat de NaskIA"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Occupied almost entirely by the giant avatar */}
            <div className="naskia-modal-chat-body naskia-modal-large-body">
              <div className="naskia-giant-avatar-wrapper-container">
                
                {/* Speech Bubble Overlay above the avatar */}
                {bubbleText && bubbleSender && (
                  <div className={`naskia-giant-bubble naskia-giant-bubble-${bubbleSender}`}>
                    <p>{bubbleText}</p>
                  </div>
                )}

                {/* Typing indicator bubble */}
                {isTyping && (
                  <div className="naskia-giant-bubble naskia-giant-bubble-naskia naskia-giant-bubble-typing">
                    <div className="naskia-typing-dot" />
                    <div className="naskia-typing-dot" />
                    <div className="naskia-typing-dot" />
                  </div>
                )}

                {/* Giant Avatar GIF */}
                <div className="naskia-giant-avatar-wrapper">
                  <img 
                    src={naskiaGif} 
                    alt="NaskIA Avatar Grande" 
                    className="naskia-giant-avatar-img"
                  />
                  
                  {/* Audio wave pulse overlay if mic active */}
                  {isMicActive && (
                    <div className="naskia-large-mic-pulse-overlay">
                      <div className="naskia-mic-waves">
                        <div className="naskia-wave wave-1" />
                        <div className="naskia-wave wave-2" />
                        <div className="naskia-wave wave-3" />
                        <Volume2 size={36} className="naskia-mic-active-icon" />
                      </div>
                      <span className="naskia-mic-feedback-text">{micFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer: Interaction block */}
            <div className="naskia-modal-footer">
              {isKeyboardActive ? (
                <form className="naskia-chat-form" onSubmit={handleSendMessage}>
                  <input 
                    type="text" 
                    className="naskia-chat-input"
                    placeholder="Escribe a NaskIA..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className="naskia-chat-send-btn"
                    disabled={!inputText.trim()}
                  >
                    <Send size={15} />
                  </button>
                  <button 
                    type="button" 
                    className="naskia-footer-icon-switch"
                    onClick={handleMicClick}
                    title="Hablar con NaskIA"
                  >
                    <Mic size={18} />
                  </button>
                </form>
              ) : (
                <div className="naskia-default-controls-row">
                  <span className="naskia-footer-instruction">Toca una opción para conversar:</span>
                  <div className="naskia-footer-buttons-group">
                    <button 
                      className={`naskia-footer-btn ${isMicActive ? 'active' : ''}`}
                      onClick={handleMicClick}
                      disabled={isMicActive}
                      title="Hablar"
                    >
                      <Mic size={20} />
                      <span>Hablar</span>
                    </button>
                    <button 
                      className="naskia-footer-btn"
                      onClick={handleKeyboardClick}
                      title="Escribir"
                    >
                      <Keyboard size={20} />
                      <span>Escribir</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
