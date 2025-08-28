import React, { useState, useEffect } from 'react';

const NotificationSystemTest = () => {
  const [testResults, setTestResults] = useState({
    backendStatus: 'testing',
    apiEndpoints: {},
    frontendComponents: {},
    websocketConnection: 'not_tested'
  });

  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // Test de l'état du backend
  const testBackendStatus = async () => {
    addLog('🔍 Test de l\'état du backend Spring Boot...', 'info');
    try {
      const response = await fetch('http://localhost:8089/PI/projects/all');
      if (response.ok) {
        addLog('✅ Backend Spring Boot accessible', 'success');
        setTestResults(prev => ({ ...prev, backendStatus: 'online' }));
        return true;
      } else {
        addLog(`❌ Backend répond avec status ${response.status}`, 'error');
        setTestResults(prev => ({ ...prev, backendStatus: 'error' }));
        return false;
      }
    } catch (error) {
      addLog(`❌ Backend inaccessible: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, backendStatus: 'offline' }));
      return false;
    }
  };

  // Test des endpoints de notifications
  const testNotificationEndpoints = async () => {
    addLog('🔍 Test des endpoints de notifications...', 'info');
    const endpoints = [
      { url: '/PI/notifications/user/1', name: 'getUserNotifications' },
      { url: '/PI/notifications/user/1/unread', name: 'getUnreadNotifications' },
      { url: '/PI/notifications/user/1/unread/count', name: 'countUnreadNotifications' },
      { url: '/PI/notifications/magasiniers', name: 'getAllMagasinierNotifications' }
    ];

    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        addLog(`🔍 Test endpoint: ${endpoint.url}`, 'info');
        const response = await fetch(`http://localhost:8089${endpoint.url}`);
        
        if (response.ok) {
          const data = await response.json();
          addLog(`✅ ${endpoint.name}: OK (${Array.isArray(data) ? data.length : typeof data} items)`, 'success');
          results[endpoint.name] = 'success';
        } else if (response.status === 403) {
          addLog(`⚠️ ${endpoint.name}: Forbidden (403) - Problème d'authentification`, 'warning');
          results[endpoint.name] = 'forbidden';
        } else {
          addLog(`❌ ${endpoint.name}: Error ${response.status}`, 'error');
          results[endpoint.name] = 'error';
        }
      } catch (error) {
        addLog(`❌ ${endpoint.name}: ${error.message}`, 'error');
        results[endpoint.name] = 'error';
      }
    }

    setTestResults(prev => ({ ...prev, apiEndpoints: results }));
  };

  // Test des composants frontend
  const testFrontendComponents = () => {
    addLog('🔍 Test des composants frontend...', 'info');
    const components = {};

    // Test NavbarNotifications
    try {
      const navbarElement = document.querySelector('[data-testid="navbar-notifications"]');
      components.NavbarNotifications = navbarElement ? 'found' : 'not_found';
      addLog(`${navbarElement ? '✅' : '❌'} NavbarNotifications: ${navbarElement ? 'Trouvé' : 'Non trouvé'}`, 
             navbarElement ? 'success' : 'warning');
    } catch (error) {
      components.NavbarNotifications = 'error';
      addLog(`❌ NavbarNotifications: ${error.message}`, 'error');
    }

    // Test MagasinierDashboard
    try {
      const dashboardElement = document.querySelector('[data-testid="magasinier-dashboard"]');
      components.MagasinierDashboard = dashboardElement ? 'found' : 'not_found';
      addLog(`${dashboardElement ? '✅' : '❌'} MagasinierDashboard: ${dashboardElement ? 'Trouvé' : 'Non trouvé'}`, 
             dashboardElement ? 'success' : 'warning');
    } catch (error) {
      components.MagasinierDashboard = 'error';
      addLog(`❌ MagasinierDashboard: ${error.message}`, 'error');
    }

    setTestResults(prev => ({ ...prev, frontendComponents: components }));
  };

  // Test WebSocket
  const testWebSocketConnection = () => {
    addLog('🔍 Test de la connexion WebSocket...', 'info');
    try {
      const ws = new WebSocket('ws://localhost:8089/PI/PI/websocket/notifications');
      
      ws.onopen = () => {
        addLog('✅ WebSocket connecté avec succès', 'success');
        setTestResults(prev => ({ ...prev, websocketConnection: 'connected' }));
        ws.close();
      };

      ws.onerror = (error) => {
        addLog(`❌ Erreur WebSocket: ${error.message || 'Connexion impossible'}`, 'error');
        setTestResults(prev => ({ ...prev, websocketConnection: 'error' }));
      };

      ws.onclose = () => {
        addLog('🔌 WebSocket fermé', 'info');
      };

      // Timeout après 5 secondes
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          addLog('⏰ Timeout WebSocket - Connexion trop lente', 'warning');
          setTestResults(prev => ({ ...prev, websocketConnection: 'timeout' }));
          ws.close();
        }
      }, 5000);

    } catch (error) {
      addLog(`❌ Erreur WebSocket: ${error.message}`, 'error');
      setTestResults(prev => ({ ...prev, websocketConnection: 'error' }));
    }
  };

  // Lancer tous les tests
  const runAllTests = async () => {
    setLogs([]);
    addLog('🚀 Début des tests du système de notifications', 'info');
    
    const backendOnline = await testBackendStatus();
    
    if (backendOnline) {
      await testNotificationEndpoints();
      testWebSocketConnection();
    } else {
      addLog('⚠️ Backend hors ligne - Tests API et WebSocket ignorés', 'warning');
    }
    
    testFrontendComponents();
    addLog('✅ Tests terminés', 'success');
  };

  useEffect(() => {
    // Lancer les tests automatiquement au montage
    runAllTests();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': case 'online': case 'connected': case 'found': return '#10b981';
      case 'warning': case 'forbidden': case 'timeout': case 'not_found': return '#f59e0b';
      case 'error': case 'offline': return '#ef4444';
      case 'testing': case 'not_tested': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': case 'online': case 'connected': case 'found': return '✅';
      case 'warning': case 'forbidden': case 'timeout': case 'not_found': return '⚠️';
      case 'error': case 'offline': return '❌';
      case 'testing': case 'not_tested': return '🔍';
      default: return '❓';
    }
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: '#003061',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 10px 0'
          }}>
            🔔 Test du Système de Notifications
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>
            Diagnostic complet du système de notifications Sagemcom
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Status Backend */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: `2px solid ${getStatusColor(testResults.backendStatus)}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              color: '#003061',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {getStatusIcon(testResults.backendStatus)} Backend Spring Boot
            </h3>
            <div style={{
              color: getStatusColor(testResults.backendStatus),
              fontWeight: '500',
              textTransform: 'uppercase',
              fontSize: '14px'
            }}>
              {testResults.backendStatus}
            </div>
          </div>

          {/* Status API Endpoints */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              color: '#003061',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 15px 0'
            }}>
              📡 Endpoints API
            </h3>
            {Object.entries(testResults.apiEndpoints).map(([name, status]) => (
              <div key={name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>{name}</span>
                <span style={{
                  color: getStatusColor(status),
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {getStatusIcon(status)} {status}
                </span>
              </div>
            ))}
          </div>

          {/* Status WebSocket */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: `2px solid ${getStatusColor(testResults.websocketConnection)}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              color: '#003061',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 15px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {getStatusIcon(testResults.websocketConnection)} WebSocket
            </h3>
            <div style={{
              color: getStatusColor(testResults.websocketConnection),
              fontWeight: '500',
              textTransform: 'uppercase',
              fontSize: '14px'
            }}>
              {testResults.websocketConnection}
            </div>
          </div>

          {/* Status Frontend */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '2px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              color: '#003061',
              fontSize: '18px',
              fontWeight: '600',
              margin: '0 0 15px 0'
            }}>
              ⚛️ Composants Frontend
            </h3>
            {Object.entries(testResults.frontendComponents).map(([name, status]) => (
              <div key={name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>{name}</span>
                <span style={{
                  color: getStatusColor(status),
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {getStatusIcon(status)} {status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton de re-test */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={runAllTests}
            style={{
              background: 'linear-gradient(135deg, #003061 0%, #0066cc 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,48,97,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 Relancer les Tests
          </button>
        </div>

        {/* Logs */}
        <div style={{
          background: '#1f2937',
          borderRadius: '12px',
          padding: '20px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <h3 style={{
            color: '#f9fafb',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 15px 0'
          }}>
            📋 Logs de Test
          </h3>
          {logs.map((log, index) => (
            <div key={index} style={{
              color: log.type === 'error' ? '#fca5a5' : 
                     log.type === 'warning' ? '#fcd34d' : 
                     log.type === 'success' ? '#86efac' : '#d1d5db',
              fontSize: '14px',
              fontFamily: 'monospace',
              marginBottom: '8px',
              padding: '4px 0'
            }}>
              <span style={{ color: '#9ca3af' }}>[{log.timestamp}]</span> {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSystemTest;
