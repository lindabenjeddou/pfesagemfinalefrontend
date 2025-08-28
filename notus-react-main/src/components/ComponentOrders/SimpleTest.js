import React from 'react';

const SimpleTest = () => {
  console.log('🟢🟢🟢 SIMPLE TEST COMPONENT LOADED! 🟢🟢🟢');
  console.log('🕒 Time:', new Date().toLocaleTimeString());
  console.log('🔍 This is a minimal test component');
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      border: '2px solid #003061',
      borderRadius: '10px',
      margin: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#003061', fontSize: '24px' }}>
        🧪 COMPOSANT TEST SIMPLE
      </h1>
      <p style={{ fontSize: '18px', color: '#333' }}>
        ✅ Si vous voyez ce message, le composant se charge correctement !
      </p>
      <p style={{ fontSize: '14px', color: '#666' }}>
        🕒 Chargé à : {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default SimpleTest;
