import React, { useState, useEffect } from 'react';

const ResponsiveLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);

  // Détecter la taille d'écran
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  // Détecter le statut en ligne/hors ligne
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Installer l'app PWA
  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  // Styles responsifs
  const getResponsiveStyles = () => ({
    container: {
      width: '100%',
      minHeight: '100vh',
      padding: isMobile ? '0.5rem' : isTablet ? '1rem' : '2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      transition: 'all 0.3s ease'
    },
    content: {
      maxWidth: isMobile ? '100%' : isTablet ? '95%' : '1200px',
      margin: '0 auto',
      background: 'white',
      borderRadius: isMobile ? '8px' : '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    },
    header: {
      padding: isMobile ? '1rem' : '1.5rem',
      background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: '1rem'
    },
    title: {
      fontSize: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '2rem',
      fontWeight: 'bold',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    statusBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      fontSize: '0.875rem',
      flexWrap: 'wrap'
    }
  });

  const styles = getResponsiveStyles();

  return (
    <div style={styles.container}>
      {/* Bannière d'installation PWA */}
      {installPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
          color: 'white',
          padding: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          fontSize: isMobile ? '0.875rem' : '1rem'
        }}>
          <span>📱 Installer l'app Sagemcom pour une meilleure expérience</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleInstallApp}
              style={{
                background: 'white',
                color: '#003061',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Installer
            </button>
            <button
              onClick={() => setInstallPrompt(null)}
              style={{
                background: 'transparent',
                color: 'white',
                border: '1px solid white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div style={styles.content}>
        {/* Header responsive */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            🏢 Sagemcom Platform
          </h1>
          
          <div style={styles.statusBar}>
            {/* Indicateur de connexion */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              background: isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${isOnline ? '#10b981' : '#ef4444'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isOnline ? '#10b981' : '#ef4444'
              }} />
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </div>

            {/* Indicateur d'appareil */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)'
            }}>
              {isMobile ? '📱' : isTablet ? '📟' : '💻'}
              {isMobile ? 'Mobile' : isTablet ? 'Tablette' : 'Desktop'}
            </div>

            {/* Indicateur d'orientation (mobile/tablette) */}
            {(isMobile || isTablet) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)'
              }}>
                {orientation === 'portrait' ? '📱' : '📱'}
                {orientation === 'portrait' ? 'Portrait' : 'Paysage'}
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal avec adaptations mobiles */}
        <div style={{
          padding: isMobile ? '1rem' : '2rem',
          minHeight: '500px'
        }}>
          {!isOnline && (
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <div style={{ fontWeight: '600', color: '#92400e' }}>
                  Mode hors ligne
                </div>
                <div style={{ fontSize: '0.875rem', color: '#b45309' }}>
                  Certaines fonctionnalités peuvent être limitées
                </div>
              </div>
            </div>
          )}

          {children}
        </div>

        {/* Footer mobile-friendly */}
        <div style={{
          padding: isMobile ? '1rem' : '1.5rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <div>
            © 2024 Sagemcom Platform - Maintenance Management
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔒 Connexion sécurisée
            </div>
            
            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📱 Version mobile
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations et responsive */}
      <style jsx global>{`
        /* Optimisations mobiles */
        @media (max-width: 767px) {
          body {
            font-size: 14px;
            line-height: 1.5;
          }
          
          input, select, textarea, button {
            min-height: 44px; /* Taille minimum pour le touch */
            font-size: 16px; /* Éviter le zoom sur iOS */
          }
          
          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
        
        /* Optimisations tablettes */
        @media (min-width: 768px) and (max-width: 1023px) {
          .grid-responsive {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        /* Optimisations desktop */
        @media (min-width: 1024px) {
          .grid-responsive {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        /* Animations optimisées pour les performances */
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Amélioration des focus pour l'accessibilité */
        button:focus,
        input:focus,
        select:focus,
        textarea:focus {
          outline: 2px solid #003061;
          outline-offset: 2px;
        }
        
        /* Support du dark mode */
        @media (prefers-color-scheme: dark) {
          .auto-dark {
            background: #1f2937;
            color: #f9fafb;
          }
        }
        
        /* Réduction des animations pour les utilisateurs sensibles */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

// Hook pour détecter la taille d'écran
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Composant de grille responsive
export const ResponsiveGrid = ({ children, minWidth = '300px', gap = '1rem' }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
      gap,
      width: '100%'
    }}>
      {children}
    </div>
  );
};

// Composant de tableau responsive
export const ResponsiveTable = ({ headers, data, onRowClick }) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    // Vue carte pour mobile
    return (
      <div style={{ display: 'grid', gap: '1rem' }}>
        {data.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick?.(row)}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              cursor: onRowClick ? 'pointer' : 'default',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            {headers.map((header, headerIndex) => (
              <div key={headerIndex} style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {header}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#374151',
                  marginTop: '0.25rem'
                }}>
                  {row[headerIndex]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Vue tableau pour desktop/tablette
  return (
    <div className="table-responsive">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {headers.map((header, index) => (
              <th key={index} style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '1px solid #e2e8f0'
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                borderBottom: '1px solid #f3f4f6'
              }}
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#374151'
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResponsiveLayout;
