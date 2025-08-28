import React, { useState, useEffect } from 'react';

const ThemeSelector = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    {
      id: 'light',
      name: 'Mode Clair',
      icon: '☀️',
      colors: {
        primary: '#003061',
        secondary: '#0066cc',
        accent: '#4da6ff',
        background: 'linear-gradient(135deg, #003061 0%, #0066cc 50%, #4da6ff 100%)',
        cardBg: 'rgba(255, 255, 255, 0.98)',
      }
    },
    {
      id: 'dark',
      name: 'Mode Sombre',
      icon: '🌙',
      colors: {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        cardBg: 'rgba(26, 26, 46, 0.95)',
      }
    },
    {
      id: 'admin',
      name: 'Admin Blue',
      icon: '👔',
      colors: {
        primary: '#003061',
        secondary: '#0066cc',
        accent: '#4da6ff',
        background: 'linear-gradient(135deg, #003061 0%, #0066cc 70%, #4da6ff 100%)',
        cardBg: 'rgba(255, 255, 255, 0.98)',
      }
    },
    {
      id: 'tech',
      name: 'Technicien Green',
      icon: '🔧',
      colors: {
        primary: '#1b5e20',
        secondary: '#2e7d32',
        accent: '#4caf50',
        background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #4caf50 100%)',
        cardBg: 'rgba(255, 255, 255, 0.98)',
      }
    },
    {
      id: 'magasinier',
      name: 'Magasinier Orange',
      icon: '📦',
      colors: {
        primary: '#e65100',
        secondary: '#ff9800',
        accent: '#ffc107',
        background: 'linear-gradient(135deg, #e65100 0%, #ff9800 50%, #ffc107 100%)',
        cardBg: 'rgba(255, 255, 255, 0.98)',
      }
    }
  ];

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('sagemcom-theme') || 'light';
    setCurrentTheme(savedTheme);
    if (onThemeChange) {
      onThemeChange(themes.find(t => t.id === savedTheme));
    }
  }, []);

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme.id);
    localStorage.setItem('sagemcom-theme', theme.id);
    setIsOpen(false);
    if (onThemeChange) {
      onThemeChange(theme);
    }
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <>
      <style jsx global>{`
        @keyframes themeFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        @keyframes themeGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 48, 97, 0.3); }
          50% { box-shadow: 0 0 30px rgba(0, 48, 97, 0.5); }
        }
      `}</style>
      
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        {/* Theme Selector Button */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
          }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${currentThemeData.colors.primary}, ${currentThemeData.colors.secondary})`,
              border: '3px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'themeFloat 3s ease-in-out infinite',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
            }}
          >
            {currentThemeData.icon}
          </button>

          {/* Theme Options Panel */}
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                top: '70px',
                right: '0',
                width: '280px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                animation: 'slideInUp 0.3s ease-out',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#003061',
                  textAlign: 'center',
                }}
              >
                🎨 Sélecteur de Thème
              </h3>
              
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: currentTheme === theme.id 
                        ? `2px solid ${theme.colors.secondary}` 
                        : '2px solid transparent',
                      background: currentTheme === theme.id 
                        ? `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}10)`
                        : 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left',
                    }}
                    onMouseOver={(e) => {
                      if (currentTheme !== theme.id) {
                        e.target.style.background = `linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}05)`;
                        e.target.style.transform = 'translateX(4px)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentTheme !== theme.id) {
                        e.target.style.background = 'rgba(0, 0, 0, 0.02)';
                        e.target.style.transform = 'translateX(0)';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                      }}
                    >
                      {theme.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: theme.colors.primary,
                          margin: '0 0 2px 0',
                        }}
                      >
                        {theme.name}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#666',
                        }}
                      >
                        {theme.id === 'light' && 'Interface claire et moderne'}
                        {theme.id === 'dark' && 'Interface sombre et élégante'}
                        {theme.id === 'admin' && 'Thème administrateur'}
                        {theme.id === 'tech' && 'Thème technicien'}
                        {theme.id === 'magasinier' && 'Thème magasinier'}
                      </div>
                    </div>
                    {currentTheme === theme.id && (
                      <div
                        style={{
                          fontSize: '16px',
                          color: theme.colors.secondary,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(0, 48, 97, 0.05)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#666',
                  textAlign: 'center',
                }}
              >
                💡 Le thème sera sauvegardé automatiquement
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ThemeSelector;
