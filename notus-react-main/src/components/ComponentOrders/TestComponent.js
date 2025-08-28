import React from 'react';

const TestComponent = () => {
  console.log('🔥🔥🔥 TEST COMPONENT LOADED! 🔥🔥🔥');
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>TEST COMPONENT WORKING!</h1>
      <p>If you see this, the routing is working correctly.</p>
    </div>
  );
};

export default TestComponent;
