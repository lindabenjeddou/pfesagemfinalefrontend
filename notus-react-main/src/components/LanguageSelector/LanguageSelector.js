import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, getAvailableLanguages, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const availableLanguages = getAvailableLanguages();

  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .language-selector-dropdown {
          animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .language-option:hover {
          animation: pulse 0.3s ease-in-out;
        }
        
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
      
      <div style={{ position: 'relative', zIndex: 1000 }}>
        {/* Language Selector Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, rgba(0, 48, 97, 0.9), rgba(0, 120, 212, 0.8))',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0, 48, 97, 0.3)',
            transform: isOpen ? 'scale(1.05)' : 'scale(1)',
            opacity: isLoading ? 0.7 : 1,
            ...(isLoading && {
              background: 'linear-gradient(135deg, rgba(0, 48, 97, 0.5), rgba(0, 120, 212, 0.4))'
            })
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 48, 97, 0.4)';
              e.target.style.background = 'linear-gradient(135deg, rgba(0, 48, 97, 1), rgba(0, 120, 212, 0.9))';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.transform = isOpen ? 'scale(1.05)' : 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 48, 97, 0.3)';
              e.target.style.background = 'linear-gradient(135deg, rgba(0, 48, 97, 0.9), rgba(0, 120, 212, 0.8))';
            }
          }}
        >
          {/* Loading Spinner */}
          {isLoading ? (
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
          ) : (
            <span style={{ fontSize: '16px' }}>{currentLang.flag}</span>
          )}
          
          <span>{currentLang.name}</span>
          
          {/* Dropdown Arrow */}
          <span
            style={{
              fontSize: '12px',
              transition: 'transform 0.3s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            ▼
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="language-selector-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              minWidth: '180px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 48, 97, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 48, 97, 0.3)',
              overflow: 'hidden',
              zIndex: 1001
            }}
          >
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                className="language-option"
                onClick={() => handleLanguageChange(language.code)}
                disabled={isLoading || language.code === currentLanguage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  background: language.code === currentLanguage 
                    ? 'linear-gradient(135deg, rgba(0, 48, 97, 0.1), rgba(0, 120, 212, 0.05))'
                    : 'transparent',
                  border: 'none',
                  color: language.code === currentLanguage ? '#003061' : '#333',
                  fontSize: '14px',
                  fontWeight: language.code === currentLanguage ? '600' : '500',
                  cursor: (isLoading || language.code === currentLanguage) ? 'default' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  opacity: language.code === currentLanguage ? 0.8 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && language.code !== currentLanguage) {
                    e.target.style.background = 'linear-gradient(135deg, rgba(0, 48, 97, 0.05), rgba(0, 120, 212, 0.03))';
                    e.target.style.transform = 'translateX(4px)';
                    e.target.style.color = '#003061';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && language.code !== currentLanguage) {
                    e.target.style.background = 'transparent';
                    e.target.style.transform = 'translateX(0)';
                    e.target.style.color = '#333';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{language.flag}</span>
                <span>{language.name}</span>
                {language.code === currentLanguage && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      color: '#003061',
                      fontWeight: '600'
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Backdrop to close dropdown */}
        {isOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default LanguageSelector;