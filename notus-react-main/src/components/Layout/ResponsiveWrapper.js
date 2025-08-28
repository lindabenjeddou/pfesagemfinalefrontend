import React, { useState, useEffect } from 'react';

const ResponsiveWrapper = ({ children, mobileComponent, desktopComponent }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Styles responsives
  const getResponsiveStyles = () => {
    if (isMobile) {
      return {
        container: {
          padding: '0.5rem',
          fontSize: '0.875rem'
        },
        grid: {
          gridTemplateColumns: '1fr',
          gap: '0.75rem'
        },
        card: {
          padding: '1rem',
          borderRadius: '8px'
        }
      };
    } else if (isTablet) {
      return {
        container: {
          padding: '1rem',
          fontSize: '0.9rem'
        },
        grid: {
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem'
        },
        card: {
          padding: '1.25rem',
          borderRadius: '10px'
        }
      };
    } else {
      return {
        container: {
          padding: '2rem',
          fontSize: '1rem'
        },
        grid: {
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        },
        card: {
          padding: '1.5rem',
          borderRadius: '12px'
        }
      };
    }
  };

  const styles = getResponsiveStyles();

  // Composant mobile spécifique si fourni
  if (isMobile && mobileComponent) {
    return mobileComponent;
  }

  // Composant desktop spécifique si fourni
  if (!isMobile && desktopComponent) {
    return desktopComponent;
  }

  // Wrapper responsive par défaut
  return (
    <div style={{
      ...styles.container,
      minHeight: isMobile ? 'calc(100vh - 120px)' : 'auto'
    }}>
      {React.cloneElement(children, {
        responsiveStyles: styles,
        isMobile,
        isTablet,
        screenSize
      })}
    </div>
  );
};

export default ResponsiveWrapper;
