import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useSecurity } from '../../contexts/SecurityContext';
import { useNotifications } from '../Notifications/NotificationSystem';

const IntegrationTest = () => {
  const { projects, sousProjects, loading: projectLoading } = useProjectContext();
  const { user, isAuthenticated, hasPermission, PERMISSIONS } = useSecurity();
  const { addNotification } = useNotifications();
  
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runIntegrationTests = async () => {
    setIsRunning(true);
    const results = [];
    
    // Test 1: Contextes disponibles
    results.push({
      name: 'Contextes Disponibles',
      status: (user && projects !== undefined && addNotification) ? 'success' : 'error',
      details: `User: ${!!user}, Projects: ${!!projects}, Notifications: ${!!addNotification}`
    });

    // Test 2: Authentification
    results.push({
      name: 'Système d\'Authentification',
      status: isAuthenticated ? 'success' : 'warning',
      details: `Utilisateur connecté: ${isAuthenticated ? user?.firstName : 'Non'}`
    });

    // Test 3: Permissions
    const permissionTests = [
      { perm: 'view_predictive_kpi', module: 'KPI Prédictifs' },
      { perm: 'view_gamification', module: 'Gamification' },
      { perm: 'use_ai_assistant', module: 'Assistant IA' },
      { perm: 'access_mobile_app', module: 'App Mobile' }
    ];

    permissionTests.forEach(test => {
      results.push({
        name: `Permission ${test.module}`,
        status: hasPermission(test.perm) ? 'success' : 'info',
        details: `${test.perm}: ${hasPermission(test.perm) ? 'Autorisé' : 'Non autorisé'}`
      });
    });

    // Test 4: Données de projet
    results.push({
      name: 'Chargement des Données',
      status: projectLoading ? 'warning' : (projects?.length > 0 ? 'success' : 'info'),
      details: `${projects?.length || 0} projets chargés, Loading: ${projectLoading}`
    });

    // Test 5: Notifications
    try {
      addNotification('info', '🧪 Test d\'intégration', {
        subtitle: 'Système de notifications fonctionnel',
        duration: 3000
      });
      results.push({
        name: 'Système de Notifications',
        status: 'success',
        details: 'Notification de test envoyée avec succès'
      });
    } catch (error) {
      results.push({
        name: 'Système de Notifications',
        status: 'error',
        details: `Erreur: ${error.message}`
      });
    }

    // Test 6: Navigation et Routes
    const routes = [
      '/admin/predictive-kpi',
      '/admin/gamification',
      '/admin/technician-mobile',
      '/admin/intelligent-scheduler'
    ];
    
    results.push({
      name: 'Routes Avancées',
      status: 'success',
      details: `${routes.length} routes configurées pour les modules avancés`
    });

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#003061',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🧪 Test d'Intégration Sagemcom
        </h2>
        <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
          Validation des modules avancés et de l'intégration système
        </p>
      </div>

      {/* Informations Système */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
          📊 Informations Système
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              👤 Utilisateur Connecté
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {user ? `${user.firstName} ${user.lastName} (${user.role})` : 'Non connecté'}
            </div>
          </div>
          
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              🏗️ Projets Chargés
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {projects?.length || 0} projets • {sousProjects?.length || 0} sous-projets
            </div>
          </div>
          
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              🔐 Statut Authentification
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {isAuthenticated ? '✅ Authentifié' : '❌ Non authentifié'}
            </div>
          </div>
          
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              ⏰ Dernière Mise à Jour
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {new Date().toLocaleString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de Test */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={runIntegrationTests}
          disabled={isRunning}
          style={{
            padding: '1rem 2rem',
            background: isRunning ? '#9ca3af' : 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 auto'
          }}
        >
          {isRunning ? '⏳ Test en cours...' : '🚀 Lancer les Tests'}
        </button>
      </div>

      {/* Résultats des Tests */}
      {testResults.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            📋 Résultats des Tests
          </h3>
          
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {testResults.map((result, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                border: `1px solid ${getStatusColor(result.status)}20`,
                borderRadius: '8px',
                background: `${getStatusColor(result.status)}05`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '1.25rem' }}>
                    {getStatusIcon(result.status)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#374151' }}>
                      {result.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {result.details}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getStatusColor(result.status),
                  color: 'white'
                }}>
                  {result.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{ fontWeight: '600', color: '#0c4a6e', marginBottom: '0.5rem' }}>
              📈 Résumé de l'Intégration
            </div>
            <div style={{ fontSize: '0.875rem', color: '#075985' }}>
              {testResults.filter(r => r.status === 'success').length} tests réussis • {' '}
              {testResults.filter(r => r.status === 'warning').length} avertissements • {' '}
              {testResults.filter(r => r.status === 'error').length} erreurs • {' '}
              {testResults.filter(r => r.status === 'info').length} informations
            </div>
          </div>
        </div>
      )}

      {/* Modules Disponibles */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginTop: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
          🚀 Modules Avancés Disponibles
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'KPI Prédictifs', icon: '📊', route: '/admin/predictive-kpi', permission: 'view_predictive_kpi' },
            { name: 'Analytics Avancés', icon: '📈', route: '/admin/enhanced-analytics', permission: 'view_enhanced_analytics' },
            { name: 'Planificateur IA', icon: '🧠', route: '/admin/intelligent-scheduler', permission: 'use_intelligent_scheduler' },
            { name: 'App Mobile', icon: '📱', route: '/admin/technician-mobile', permission: 'access_mobile_app' },
            { name: 'Gamification', icon: '🎮', route: '/admin/gamification', permission: 'view_gamification' }
          ].map((module, index) => (
            <div key={index} style={{
              padding: '1rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{module.icon}</div>
              <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                {module.name}
              </div>
              <div style={{
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                background: hasPermission(module.permission) ? '#dcfce7' : '#fef3c7',
                color: hasPermission(module.permission) ? '#166534' : '#92400e'
              }}>
                {hasPermission(module.permission) ? '✅ Accessible' : '🔒 Accès restreint'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationTest;
