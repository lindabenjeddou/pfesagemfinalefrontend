import React, { useState, useEffect } from 'react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useSecurity } from '../../contexts/SecurityContext';
import { useNotifications } from '../Notifications/NotificationSystem';

const TechnicianMobileApp = () => {
  const { projects } = useProjectContext();
  const { user, hasPermission, PERMISSIONS } = useSecurity();
  const { addNotification } = useNotifications();
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [activeTab, setActiveTab] = useState('planning');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [scannerActive, setScannerActive] = useState(false);

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          addNotification('warning', '📍 Géolocalisation non disponible', {
            subtitle: 'Certaines fonctionnalités seront limitées'
          });
        }
      );
    }
  }, []);

  // Détection online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Charger les interventions du technicien
  useEffect(() => {
    fetchTechnicianInterventions();
  }, [user]);

  const fetchTechnicianInterventions = async () => {
    try {
      const response = await fetch(`http://localhost:8089/PI/PI/demandes/recuperer/all`);
      if (response.ok) {
        const data = await response.json();
        const technicianInterventions = data.filter(int => 
          int.demandeurId === user?.id || int.assignedTechnicianId === user?.id
        ).map(int => ({
          id: int.id,
          title: int.description || 'Intervention',
          type: int.type || 'CURATIVE',
          status: int.statut || 'PLANIFIE',
          priority: int.priority || 'NORMAL',
          scheduledDate: new Date(int.dateCreation),
          location: int.location || 'Site Sagemcom',
          equipment: int.equipment || 'Équipement non spécifié',
          estimatedDuration: int.estimatedDuration || 120, // minutes
          requiredPDR: int.requiredPDR || [],
          coordinates: int.coordinates || { lat: 36.8065, lng: 10.1815 } // Tunis par défaut
        }));
        
        setInterventions(technicianInterventions);
      }
    } catch (error) {
      if (!isOnline) {
        // Mode offline - charger depuis le cache local
        const cachedData = localStorage.getItem('cached_interventions');
        if (cachedData) {
          setInterventions(JSON.parse(cachedData));
        }
      }
    }
  };

  // Synchroniser les données hors ligne
  const syncOfflineData = async () => {
    if (offlineQueue.length > 0) {
      addNotification('info', '🔄 Synchronisation en cours...', {
        subtitle: `${offlineQueue.length} actions à synchroniser`
      });

      for (const action of offlineQueue) {
        try {
          await executeAction(action);
        } catch (error) {
          console.error('Erreur sync:', error);
        }
      }
      
      setOfflineQueue([]);
      addNotification('success', '✅ Synchronisation terminée!');
    }
  };

  const executeAction = async (action) => {
    switch (action.type) {
      case 'UPDATE_STATUS':
        await fetch(`http://localhost:8089/PI/PI/demandes/update/${action.interventionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statut: action.status === 'TERMINE' ? 'TERMINEE' : action.status })
        });
        break;
      case 'ADD_REPORT':
        await fetch(`http://localhost:8089/PI/PI/reports/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.report)
        });
        break;
      default:
        break;
    }
  };

  // Calculer la distance entre deux points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Scanner QR/RFID (simulation)
  const startScanner = () => {
    setScannerActive(true);
    
    // Simulation du scan
    setTimeout(() => {
      const scannedEquipment = {
        id: 'EQ-' + Math.random().toString(36).substr(2, 9),
        name: 'Compresseur Atlas Copco GA22',
        location: 'Atelier Mécanique - Zone A',
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-04-15'
      };
      
      setScannerActive(false);
      addNotification('success', '📱 Équipement scanné!', {
        subtitle: scannedEquipment.name,
        duration: 5000
      });
      
      // Pré-remplir les informations d'intervention
      if (selectedIntervention) {
        setSelectedIntervention({
          ...selectedIntervention,
          scannedEquipment
        });
      }
    }, 3000);
  };

  // Mettre à jour le statut d'intervention
  const updateInterventionStatus = (interventionId, newStatus) => {
    const action = {
      type: 'UPDATE_STATUS',
      interventionId,
      status: newStatus,
      timestamp: new Date().toISOString()
    };

    if (isOnline) {
      executeAction(action);
    } else {
      setOfflineQueue([...offlineQueue, action]);
      addNotification('info', '📴 Action mise en file d\'attente', {
        subtitle: 'Sera synchronisée à la reconnexion'
      });
    }

    // Mettre à jour localement
    setInterventions(interventions.map(int => 
      int.id === interventionId ? { ...int, status: newStatus } : int
    ));
  };

  // Composant Planning
  const PlanningTab = () => (
    <div style={{ padding: '1rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, color: '#003061' }}>📅 Mon Planning</h3>
        <div style={{
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.875rem',
          fontWeight: '600',
          background: isOnline ? '#dcfce7' : '#fef3c7',
          color: isOnline ? '#166534' : '#92400e'
        }}>
          {isOnline ? '🟢 En ligne' : '🟡 Hors ligne'}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {interventions.map(intervention => {
          const distance = currentLocation ? 
            calculateDistance(
              currentLocation.latitude, currentLocation.longitude,
              intervention.coordinates.lat, intervention.coordinates.lng
            ) : null;

          return (
            <div
              key={intervention.id}
              onClick={() => setSelectedIntervention(intervention)}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                    {intervention.type === 'CURATIVE' ? '🔧' : '🛡️'} {intervention.title}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    📍 {intervention.location}
                  </div>
                </div>
                
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: intervention.status === 'TERMINE' ? '#dcfce7' : 
                             intervention.status === 'EN_COURS' ? '#fef3c7' : '#dbeafe',
                  color: intervention.status === 'TERMINE' ? '#166534' :
                         intervention.status === 'EN_COURS' ? '#92400e' : '#1e40af'
                }}>
                  {intervention.status === 'TERMINE' ? '✅ Terminé' :
                   intervention.status === 'EN_COURS' ? '⏳ En cours' : '📋 Planifié'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                <div>
                  🕐 {intervention.scheduledDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  ⏱️ {intervention.estimatedDuration}min
                </div>
                
                {distance && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    📍 {distance.toFixed(1)} km
                  </div>
                )}
              </div>

              {intervention.priority === 'URGENT' && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  🚨 URGENT
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Composant Intervention Détail
  const InterventionDetail = () => {
    if (!selectedIntervention) return null;

    return (
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setSelectedIntervention(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h3 style={{ margin: 0, color: '#003061' }}>
            {selectedIntervention.type === 'CURATIVE' ? '🔧' : '🛡️'} Détails Intervention
          </h3>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '1rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#374151', marginBottom: '0.5rem' }}>
              {selectedIntervention.title}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              📍 {selectedIntervention.location}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Date & Heure
              </div>
              <div style={{ fontWeight: '600', color: '#374151' }}>
                {selectedIntervention.scheduledDate.toLocaleDateString('fr-FR')} à{' '}
                {selectedIntervention.scheduledDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Durée Estimée
              </div>
              <div style={{ fontWeight: '600', color: '#374151' }}>
                ⏱️ {selectedIntervention.estimatedDuration} minutes
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Équipement
            </div>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              {selectedIntervention.scannedEquipment?.name || selectedIntervention.equipment}
            </div>
          </div>

          {/* Actions rapides */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              onClick={() => updateInterventionStatus(selectedIntervention.id, 'EN_COURS')}
              disabled={selectedIntervention.status === 'EN_COURS' || selectedIntervention.status === 'TERMINE'}
              style={{
                padding: '0.75rem',
                background: selectedIntervention.status === 'EN_COURS' ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: selectedIntervention.status === 'EN_COURS' ? 'not-allowed' : 'pointer'
              }}
            >
              {selectedIntervention.status === 'EN_COURS' ? '⏳ En cours' : '▶️ Démarrer'}
            </button>
            
            <button
              onClick={() => updateInterventionStatus(selectedIntervention.id, 'TERMINE')}
              disabled={selectedIntervention.status !== 'EN_COURS'}
              style={{
                padding: '0.75rem',
                background: selectedIntervention.status === 'TERMINE' ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: selectedIntervention.status !== 'EN_COURS' ? 'not-allowed' : 'pointer'
              }}
            >
              {selectedIntervention.status === 'TERMINE' ? '✅ Terminé' : '🏁 Terminer'}
            </button>
          </div>

          {/* Scanner QR/RFID */}
          <button
            onClick={startScanner}
            disabled={scannerActive}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: scannerActive ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: scannerActive ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {scannerActive ? '📱 Scan en cours...' : '📱 Scanner Équipement'}
          </button>

          {/* Navigation */}
          {currentLocation && (
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${selectedIntervention.coordinates.lat},${selectedIntervention.coordinates.lng}`;
                window.open(url, '_blank');
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🗺️ Navigation GPS
            </button>
          )}
        </div>
      </div>
    );
  };

  // Composant PDR
  const PDRTab = () => (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#003061' }}>📦 Commande PDR</h3>
      
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Rechercher une pièce..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {[
            { name: 'Roulement SKF 6205', ref: 'PDR-001', stock: 5, urgent: true },
            { name: 'Courroie HTD 8M', ref: 'PDR-002', stock: 12, urgent: false },
            { name: 'Capteur proximité', ref: 'PDR-003', stock: 2, urgent: true }
          ].map((pdr, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#374151' }}>
                  {pdr.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Réf: {pdr.ref} • Stock: {pdr.stock}
                </div>
              </div>
              
              <button style={{
                padding: '0.5rem 1rem',
                background: pdr.urgent ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {pdr.urgent ? '🚨 Urgent' : '➕ Commander'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      background: '#f8fafc',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Header Mobile */}
      <div style={{
        background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
        color: 'white',
        padding: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              👋 Bonjour {user?.firstName}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {user?.role}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentLocation && (
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                📍 GPS
              </div>
            )}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isOnline ? '#10b981' : '#f59e0b'
            }} />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {selectedIntervention ? (
        <InterventionDetail />
      ) : (
        <>
          {activeTab === 'planning' && <PlanningTab />}
          {activeTab === 'pdr' && <PDRTab />}
        </>
      )}

      {/* Navigation Bottom */}
      {!selectedIntervention && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '400px',
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.75rem'
        }}>
          <button
            onClick={() => setActiveTab('planning')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: activeTab === 'planning' ? '#003061' : 'transparent',
              color: activeTab === 'planning' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📅 Planning
          </button>
          
          <button
            onClick={() => setActiveTab('pdr')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: activeTab === 'pdr' ? '#003061' : 'transparent',
              color: activeTab === 'pdr' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📦 PDR
          </button>
        </div>
      )}
    </div>
  );
};

export default TechnicianMobileApp;
